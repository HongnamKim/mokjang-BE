import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMINISTRIES_DOMAIN_SERVICE,
  IMinistriesDomainService,
} from '../ministries-domain/interface/ministries-domain.service.interface';
import {
  IMINISTRY_GROUPS_DOMAIN_SERVICE,
  IMinistryGroupsDomainService,
} from '../ministries-domain/interface/ministry-groups-domain.service.interface';
import {
  IMINISTRY_MEMBERS_DOMAIN_SERVICE,
  IMinistryMembersDomainService,
} from '../../../members/member-domain/interface/ministry-members-domain.service.interface';
import { QueryRunner } from 'typeorm';
import { MinistryPatchResponseDto } from '../dto/ministry/response/ministry-patch-response.dto';
import { RemoveMinistryFromMember } from '../dto/ministry/request/member/remove-ministry-from-member.dto';
import { StartMinistryHistoryVo } from '../../../member-history/ministry-history/dto/start-ministry-history.vo';
import {
  IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupHistoryDomainService,
} from '../../../member-history/ministry-history/ministry-history-domain/interface/ministry-group-history-domain.service.interface';
import { EndMinistryHistoryVo } from '../../../member-history/ministry-history/dto/end-ministry-history.vo';
import {
  IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupDetailHistoryDomainService,
} from '../../../member-history/ministry-history/ministry-history-domain/interface/ministry-group-detail-history-domain.service.interface';
import {
  getEndOfToday,
  getStartOfToday,
} from '../../../member-history/history-date.utils';
import { TIME_ZONE } from '../../../common/const/time-zone.const';

@Injectable()
export class MinistryMemberService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRIES_DOMAIN_SERVICE)
    private readonly ministriesDomainService: IMinistriesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,

    @Inject(IMINISTRY_MEMBERS_DOMAIN_SERVICE)
    private readonly ministryMembersDomainService: IMinistryMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupHistoryDomainService: IMinistryGroupHistoryDomainService,
    @Inject(IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupDetailHistoryDomainService: IMinistryGroupDetailHistoryDomainService,
  ) {}

  async refreshMinistryMemberCount(
    churchId: number,
    ministryGroupId: number,
    ministryId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
      );

    const ministry = await this.ministriesDomainService.findMinistryModelById(
      ministryGroup,
      ministryId,
      qr,
      { members: true },
    );

    /*if (ministry.members.length === ministry.membersCount) {
      throw new BadRequestException('');
    }*/

    const updatedMinistry =
      await this.ministriesDomainService.refreshMembersCount(
        ministry,
        ministry.members.length,
        qr,
      );

    return new MinistryPatchResponseDto(updatedMinistry);
  }

  async assignMemberToMinistry(
    churchId: number,
    ministryGroupId: number,
    ministryId: number,
    dto: any,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
      );

    // 요청한 교인이 MinistryGroup 에 속해있는지 확인 + 해당 사역그룹 내에서 맡은 사역
    const member =
      await this.ministryMembersDomainService.findMinistryGroupMemberModelById(
        ministryGroup,
        dto.memberId,
        qr,
      );

    const oldMinistry = member.ministries;

    const isAlreadyAssigned = oldMinistry.some(
      (ministry) => ministry.id === ministryId,
    );

    if (isAlreadyAssigned) {
      throw new ConflictException('이미 부여된 사역입니다.');
    }

    // 해당 사역 그룹에 존재하는 사역인지 확인 필요
    const newMinistry =
      await this.ministriesDomainService.findMinistryModelById(
        ministryGroup,
        ministryId,
        qr,
      );

    // 기존 사역 삭제 + 새로운 사역 추가
    await this.ministriesDomainService.assignMemberToMinistry(
      member,
      oldMinistry,
      newMinistry,
      qr,
    );

    // 새로운 사역의 교인 수 증가
    await this.ministriesDomainService.incrementMembersCount(newMinistry, qr);

    // 기존 사역의 교인 수 감소 및 이력 종료
    if (oldMinistry.length > 0) {
      await Promise.all(
        oldMinistry.map((oldMinistry) =>
          this.ministriesDomainService.decrementMembersCount(oldMinistry, qr),
        ),
      );

      const endMinistryVo = oldMinistry.map(
        (old) => new EndMinistryHistoryVo(member, old),
      );
      const endDate = getEndOfToday(TIME_ZONE.SEOUL);
      await this.ministryGroupDetailHistoryDomainService.validateMinistryEndDates(
        endMinistryVo,
        endDate,
        qr,
      );

      await this.ministryGroupDetailHistoryDomainService.endMinistryHistories(
        endMinistryVo,
        endDate,
        qr,
      );
    }

    // 교인 사역 이력 생성
    const ministryGroupHistory =
      await this.ministryGroupHistoryDomainService.findCurrentMinistryGroupHistory(
        member,
        ministryGroup,
        qr,
      );
    const startMinistryVo = new StartMinistryHistoryVo(
      member,
      newMinistry,
      ministryGroupHistory,
    );
    await this.ministryGroupDetailHistoryDomainService.startMinistryHistories(
      [startMinistryVo],
      getStartOfToday(TIME_ZONE.SEOUL),
      qr,
    );

    return this.ministryMembersDomainService.findMinistryGroupMemberById(
      ministryGroup,
      dto.memberId,
      qr,
    );
  }

  async removeMemberFromMinistry(
    churchId: number,
    ministryGroupId: number,
    ministryId: number,
    dto: RemoveMinistryFromMember,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
      );

    // 해당 사역에 속한 교인 + 맡은 사역
    const member =
      await this.ministryMembersDomainService.findMinistryGroupMemberModelById(
        ministryGroup,
        dto.memberId,
        qr,
      );

    const ministry = await this.ministriesDomainService.findMinistryModelById(
      ministryGroup,
      ministryId,
      qr,
    );

    const isAssignedMinistry = member.ministries.some(
      (ministry) => ministry.id === ministryId,
    );

    if (!isAssignedMinistry) {
      throw new BadRequestException(
        `해당 교인은 해당 사역을 담당하고 있지 않습니다.`,
      );
    }

    // 교인 - 사역 relation 끊기
    await this.ministriesDomainService.removeMemberFromMinistry(
      member,
      ministry,
      qr,
    );

    // 사역 이력 종료
    const endMinistryVo = new EndMinistryHistoryVo(member, ministry);
    const endDate = getEndOfToday(TIME_ZONE.SEOUL);
    await this.ministryGroupDetailHistoryDomainService.validateMinistryEndDates(
      [endMinistryVo],
      endDate,
      qr,
    );
    await this.ministryGroupDetailHistoryDomainService.endMinistryHistories(
      [endMinistryVo],
      endDate,
      qr,
    );

    // 종료된 사역의 교인 수 감소
    await this.ministriesDomainService.decrementMembersCount(ministry, qr);

    return this.ministryMembersDomainService.findMinistryGroupMemberById(
      ministryGroup,
      dto.memberId,
      qr,
    );
  }
}
