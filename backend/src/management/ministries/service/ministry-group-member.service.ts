import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

    const members = await this.membersDomainService.findMembersById(
      church,
      memberIds,
      qr,
    );

    // 사역 그룹에 교인 추가
    await this.ministryGroupsDomainService.addMembersToMinistryGroup(
      ministryGroup,
      members,
      qr,
    );

    await this.ministryGroupsDomainService.updateMembersCount(
      ministryGroup,
      members.length,
      qr,
    );

    // 사역그룹 역할 설정
    await this.ministryMembersDomainService.updateMinistryGroupRole(
      members,
      GroupRole.MEMBER,
      qr,
    );

    // 사역 그룹에 교인 추가 완료

    // 교인에게 사역 할당
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

    await Promise.all(
      memberMinistryMapped.map((memberMinistry) =>
        this.ministryDomainService.incrementMembersCount(
          memberMinistry.ministry,
          qr,
        ),
      ),
    );

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

    const members =
      await this.ministryMembersDomainService.findMinistryGroupMembersByIds(
        ministryGroup,
        memberIds,
        qr,
      );

    await this.ministryGroupsDomainService.removeMembersFromMinistryGroup(
      ministryGroup,
      members,
      qr,
    );

    // 사역이 있는 교인들의 사역 종료
    const ministryMembers = members.filter(
      (member) => member.ministries.length > 0,
    );

    if (ministryMembers.length > 0) {
      await Promise.all(
        ministryMembers.map((member) =>
          this.ministryDomainService.removeMemberFromMinistry(
            member,
            member.ministries[0],
            qr,
          ),
        ),
      );

      await Promise.all(
        ministryMembers.map((member) =>
          this.ministryDomainService.decrementMembersCount(
            member.ministries[0],
            qr,
          ),
        ),
      );
    }
    // 사역이 있는 교인들의 사역 종료

    await this.ministryMembersDomainService.updateMinistryGroupRole(
      members,
      GroupRole.NONE,
      qr,
    );

    await this.ministryGroupsDomainService.updateMembersCount(
      ministryGroup,
      -1 * members.length,
      qr,
    );

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
