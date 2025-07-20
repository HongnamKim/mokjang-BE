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
import { RemoveMinistryFromMember } from '../dto/ministry/remove-ministry-from-member.dto';

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

    const alreadyAssigned = oldMinistry.some(
      (ministry) => ministry.id === ministryId,
    );

    if (alreadyAssigned) {
      throw new ConflictException('이미 부여된 사역입니다.');
    }

    // 해당 사역 그룹에 존재하는 사역인지 확인 필요
    const newMinistry =
      await this.ministriesDomainService.findMinistryModelById(
        //church,
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

    await this.ministriesDomainService.incrementMembersCount(newMinistry, qr);
    if (oldMinistry.length > 0) {
      await Promise.all(
        oldMinistry.map((oldMinistry) =>
          this.ministriesDomainService.decrementMembersCount(oldMinistry, qr),
        ),
      );
    }

    // 교인 사역 이력 생성 및 종료

    return this.ministryMembersDomainService.findMinistryGroupMemberModelById(
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
        `교인 ${dto.memberId}는 해당 사역을 담당하고 있지 않습니다.`,
      );
    }

    await this.ministriesDomainService.removeMemberFromMinistry(
      member,
      ministry,
      qr,
    );

    await this.ministriesDomainService.decrementMembersCount(ministry, qr);

    return this.ministryMembersDomainService.findMinistryGroupMemberModelById(
      ministryGroup,
      dto.memberId,
      qr,
    );
  }
}
