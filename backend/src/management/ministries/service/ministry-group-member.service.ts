import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMINISTRY_GROUPS_DOMAIN_SERVICE,
  IMinistryGroupsDomainService,
} from '../ministries-domain/interface/ministry-groups-domain.service.interface';
import {
  IMINISTRIES_DOMAIN_SERVICE,
  IMinistriesDomainService,
} from '../ministries-domain/interface/ministries-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import {
  IMINISTRY_MEMBERS_DOMAIN_SERVICE,
  IMinistryMembersDomainService,
} from '../../../members/member-domain/interface/ministry-members-domain.service.interface';
import { AddMemberToMinistryGroupDto } from '../dto/ministry-group/request/member/add-member-to-ministry-group.dto';
import { QueryRunner } from 'typeorm';
import { GroupRole } from '../../groups/const/group-role.enum';
import { MemberModel } from '../../../members/entity/member.entity';
import { MinistryModel } from '../entity/ministry.entity';
import { GetMinistryGroupMembersDto } from '../dto/ministry-group/request/member/get-ministry-group-members.dto';
import { SearchMembersForMinistryGroupDto } from '../dto/ministry-group/request/member/search-members-for-ministry-group.dto';
import {
  IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupHistoryDomainService,
} from '../../../member-history/ministry-history/ministry-history-domain/interface/ministry-group-history-domain.service.interface';
import { StartMinistryHistoryVo } from '../../../member-history/ministry-history/dto/start-ministry-history.vo';
import {
  IMINISTRY_HISTORY_DOMAIN_SERVICE,
  IMinistryHistoryDomainService,
} from '../../../member-history/ministry-history/ministry-history-domain/interface/ministry-history-domain.service.interface';
import { EndMinistryHistoryVo } from '../../../member-history/ministry-history/dto/end-ministry-history.vo';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MinistryGroupModel } from '../entity/ministry-group.entity';
import { MinistryGroupHistoryModel } from '../../../member-history/ministry-history/entity/ministry-group-history.entity';

@Injectable()
export class MinistryGroupMemberService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,
    @Inject(IMINISTRIES_DOMAIN_SERVICE)
    private readonly ministryDomainService: IMinistriesDomainService,

    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IMINISTRY_MEMBERS_DOMAIN_SERVICE)
    private readonly ministryMembersDomainService: IMinistryMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupHistoryDomainService: IMinistryGroupHistoryDomainService,
    @Inject(IMINISTRY_HISTORY_DOMAIN_SERVICE)
    private readonly ministryHistoryDomainService: IMinistryHistoryDomainService,
  ) {}

  async addMemberToMinistryGroup(
    churchId: number,
    ministryGroupId: number,
    dto: AddMemberToMinistryGroupDto,
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

    const memberIds = dto.members.map((m) => m.memberId);
    if (memberIds.length !== new Set(memberIds).size) {
      throw new BadRequestException('중복된 교인 ID 가 존재합니다.');
    }

    // 추가 대상 교인
    const members = await this.membersDomainService.findMembersById(
      church,
      memberIds,
      qr,
    );

    // 사역그룹에 교인 추가 + 교인 수 증가 (중복될 경우 Exception)
    await this.ministryGroupsDomainService.addMembersToMinistryGroup(
      ministryGroup,
      members,
      qr,
    );

    // 사역그룹 역할 설정 (ministryGroupRole)
    await this.ministryMembersDomainService.updateMinistryGroupRole(
      members,
      GroupRole.MEMBER,
      qr,
    );

    // 사역그룹 이력 생성
    const ministryGroupHistories =
      await this.ministryGroupHistoryDomainService.startMinistryGroupHistories(
        ministryGroup,
        members,
        qr,
      );
    // 사역 그룹에 교인 추가 완료

    const needToAssignMinistry = dto.members.some(
      (member) => member.ministryId,
    );

    if (needToAssignMinistry) {
      await this.assignMinistry(
        church,
        ministryGroup,
        ministryGroupHistories,
        dto,
        members,
        qr,
      );
    }

    const updatedMinistryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupById(
        church,
        ministryGroupId,
        qr,
      );

    return {
      data: updatedMinistryGroup,
      timestamp: new Date(),
    };
  }

  private async assignMinistry(
    church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    ministryGroupHistories: MinistryGroupHistoryModel[],
    dto: AddMemberToMinistryGroupDto,
    members: MemberModel[],
    qr: QueryRunner,
  ) {
    const ministryIds = Array.from(
      new Set(
        dto.members
          .filter((m) => m.ministryId)
          .map((m) => m.ministryId) as number[],
      ),
    );

    const ministries = await this.ministryDomainService.findMinistriesByIds(
      church,
      ministryGroup,
      ministryIds,
      qr,
    );

    // Member - Ministry 객체 매핑한 배열
    const memberMinistryMapped: {
      member: MemberModel;
      ministry: MinistryModel;
    }[] = [];

    // 매핑 과정
    for (const requestInput of dto.members) {
      const requestMember = members.find(
        (member) => member.id === requestInput.memberId,
      ) as MemberModel;

      if (requestInput.ministryId) {
        const requestMinistry = ministries.find(
          (ministry) => ministry.id === requestInput.ministryId,
        ) as MinistryModel;

        memberMinistryMapped.push({
          member: requestMember,
          ministry: requestMinistry,
        });
      }
    }

    // 사역이 부여된 교인이 있는 경우

    // 교인에게 사역 부여
    await Promise.all(
      memberMinistryMapped.map((memberMinistry) =>
        this.ministryDomainService.assignMemberToMinistry(
          memberMinistry.member,
          [],
          memberMinistry.ministry,
          qr,
        ),
      ),
    );

    // 사역 이력 생성
    const ministryHistoryVo = memberMinistryMapped.map((memberMinistry) => {
      const ministryGroupHistory = ministryGroupHistories.find(
        (ministryGroupHistory) =>
          ministryGroupHistory.memberId === memberMinistry.member.id,
      );

      if (!ministryGroupHistory) {
        throw new InternalServerErrorException('사역그룹 이력 생성 에러');
      }

      return new StartMinistryHistoryVo(
        memberMinistry.member,
        memberMinistry.ministry,
        ministryGroupHistory,
      );
    });

    await this.ministryHistoryDomainService.startMinistryHistories(
      ministryHistoryVo,
      qr,
    );

    // 사역 별 교인 수 증가
    await Promise.all(
      memberMinistryMapped.map((memberMinistry) =>
        this.ministryDomainService.incrementMembersCount(
          memberMinistry.ministry,
          qr,
        ),
      ),
    );
  }

  async getMinistryGroupMembers(
    churchId: number,
    ministryGroupId: number,
    dto: GetMinistryGroupMembersDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
      );

    const members =
      await this.ministryMembersDomainService.findMinistryGroupMembers(
        ministryGroup,
        dto,
      );

    return { data: members, timestamp: new Date() };
  }

  // TODO 교인 ministryGroupRole 처리 필요
  async removeMembersFromMinistryGroup(
    churchId: number,
    ministryGroupId: number,
    memberIds: number[],
    qr: QueryRunner,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
      );

    // 제거 대상 교인 + 담당사역
    const removeMembers =
      await this.ministryMembersDomainService.findMinistryGroupMembersByIds(
        ministryGroup,
        memberIds,
        qr,
      );

    // 사역그룹에서 교인 제거 + 교인 수 감소
    await this.ministryGroupsDomainService.removeMembersFromMinistryGroup(
      ministryGroup,
      removeMembers,
      qr,
    );

    // 사역그룹 스냅샷
    const ministryGroupSnapShot =
      await this.ministryGroupsDomainService.getMinistryGroupNameWithHierarchy(
        church,
        ministryGroupId,
        qr,
      );

    // 사역그룹 이력 종료
    await this.ministryGroupHistoryDomainService.endMinistryGroupHistories(
      ministryGroup,
      ministryGroupSnapShot,
      removeMembers,
      qr,
    );

    // 삭제 교인 중 리더가 있는 경우
    if (
      removeMembers.some((member) => member.id === ministryGroup.leaderMemberId)
    ) {
      await this.ministryGroupsDomainService.updateMinistryGroupLeader(
        ministryGroup,
        null,
        qr,
      );
    }

    // 사역이 있는 교인들의 사역 종료
    const ministryMembers = removeMembers.filter(
      (member) => member.ministries.length > 0,
    );
    if (ministryMembers.length > 0) {
      // 사역 관계 해제
      await Promise.all(
        ministryMembers.map((member) =>
          this.ministryDomainService.removeMemberFromMinistry(
            member,
            member.ministries[0],
            qr,
          ),
        ),
      );

      // 사역의 교인 수 감소
      await Promise.all(
        ministryMembers.map((member) =>
          this.ministryDomainService.decrementMembersCount(
            member.ministries[0],
            qr,
          ),
        ),
      );

      const endMinistryHistoryVo = ministryMembers.map(
        (ministryMember) =>
          new EndMinistryHistoryVo(
            ministryMember,
            ministryMember.ministries[0],
          ),
      );

      // 사역이 있는 교인들의 사역 종료
      await this.ministryHistoryDomainService.endMinistryHistories(
        endMinistryHistoryVo,
        qr,
      );
    }

    // 사역그룹 역할 제거 (ministryGroupRole)
    await this.ministryMembersDomainService.updateMinistryGroupRole(
      removeMembers,
      GroupRole.NONE,
      qr,
    );

    // 응답부분
    const updatedMinistryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupById(
        church,
        ministryGroupId,
        qr,
      );

    return { data: updatedMinistryGroup, timestamp: new Date() };
  }

  async searchMembersForMinistryGroup(
    churchId: number,
    ministryGroupId: number,
    dto: SearchMembersForMinistryGroupDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
      );

    const data =
      await this.ministryMembersDomainService.searchMembersForMinistryGroup(
        church,
        ministryGroup,
        dto,
      );

    return {
      data,
      timestamp: new Date(),
    };
  }
}
