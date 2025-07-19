import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MinistryGroupModel } from '../entity/ministry-group.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateMinistryGroupDto } from '../dto/ministry-group/request/create-ministry-group.dto';
import { UpdateMinistryGroupNameDto } from '../dto/ministry-group/request/update-ministry-group-name.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMINISTRY_GROUPS_DOMAIN_SERVICE,
  IMinistryGroupsDomainService,
} from '../ministries-domain/interface/ministry-groups-domain.service.interface';
import { GetMinistryGroupDto } from '../dto/ministry-group/request/get-ministry-group.dto';
import { MinistryGroupPaginationResultDto } from '../dto/ministry-group/response/ministry-group-pagination-result.dto';
import { MinistryGroupPostResponseDto } from '../dto/ministry-group/response/ministry-group-post-response.dto';
import { MinistryGroupPatchResponseDto } from '../dto/ministry-group/response/ministry-group-patch-response.dto';
import { MinistryGroupDeleteResponseDto } from '../dto/ministry-group/response/ministry-group-delete-response.dto';
import { UpdateMinistryGroupStructureDto } from '../dto/ministry-group/request/update-ministry-group-structure.dto';
import {
  ChurchModel,
  ManagementCountType,
} from '../../../churches/entity/church.entity';
import { AddMemberToMinistryGroupDto } from '../dto/ministry-group/request/add-member-to-ministry-group.dto';
import {
  IMINISTRIES_DOMAIN_SERVICE,
  IMinistriesDomainService,
} from '../ministries-domain/interface/ministries-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import { GetMinistryGroupMembersDto } from '../dto/ministry-group/request/get-ministry-group-members.dto';
import { GroupRole } from '../../groups/const/group-role.enum';
import { UpdateMinistryGroupLeaderDto } from '../dto/ministry-group/request/update-ministry-group-leader.dto';
import { MemberModel } from '../../../members/entity/member.entity';
import { MinistryModel } from '../entity/ministry.entity';

@Injectable()
export class MinistryGroupService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,
    @Inject(IMINISTRIES_DOMAIN_SERVICE)
    private readonly ministryDomainService: IMinistriesDomainService,

    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
  ) {}

  async getMinistryGroups(churchId: number, dto: GetMinistryGroupDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const parentMinistryGroup = dto.parentMinistryGroupId
      ? await this.ministryGroupsDomainService.findMinistryGroupModelById(
          church,
          dto.parentMinistryGroupId,
        )
      : null;

    const result = await this.ministryGroupsDomainService.findMinistryGroups(
      church,
      parentMinistryGroup,
      dto,
    );

    return new MinistryGroupPaginationResultDto(
      result.data,
      result.totalCount,
      result.data.length,
      dto.page,
      Math.ceil(result.totalCount / dto.take),
    );
  }

  async getMinistryGroupModelById(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupModel>,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministryGroupsDomainService.findMinistryGroupModelById(
      church,
      ministryGroupId,
      qr,
      relationOptions,
    );
  }

  async getMinistryGroupById(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministryGroupsDomainService.findMinistryGroupById(
      church,
      ministryGroupId,
      qr,
    );
  }

  async createMinistryGroup(
    churchId: number,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const parentMinistryGroup = dto.parentMinistryGroupId
      ? await this.ministryGroupsDomainService.findMinistryGroupModelById(
          church,
          dto.parentMinistryGroupId,
          qr,
        )
      : null;

    const newMinistryGroup =
      await this.ministryGroupsDomainService.createMinistryGroup(
        church,
        parentMinistryGroup,
        dto,
        qr,
      );

    await this.churchesDomainService.incrementManagementCount(
      church,
      ManagementCountType.MINISTRY_GROUP,
      qr,
    );

    return new MinistryGroupPostResponseDto(newMinistryGroup);
  }

  async updateMinistryGroupStructure(
    churchId: number,
    ministryGroupId: number,
    dto: UpdateMinistryGroupStructureDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetMinistryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
        { parentMinistryGroup: true },
      );

    let newParentMinistryGroup: MinistryGroupModel | null;

    if (dto.parentMinistryGroupId === undefined) {
      newParentMinistryGroup = targetMinistryGroup.parentMinistryGroup;
    } else if (dto.parentMinistryGroupId === null) {
      newParentMinistryGroup = null;
    } else {
      newParentMinistryGroup =
        await this.ministryGroupsDomainService.findMinistryGroupModelById(
          church,
          dto.parentMinistryGroupId,
          qr,
        );
    }

    await this.ministryGroupsDomainService.updateMinistryGroupStructure(
      church,
      targetMinistryGroup,
      dto,
      qr,
      newParentMinistryGroup,
    );

    const updatedMinistryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupById(
        church,
        ministryGroupId,
        qr,
      );

    return new MinistryGroupPatchResponseDto(updatedMinistryGroup);
  }

  async updateMinistryGroupName(
    churchId: number,
    ministryGroupId: number,
    dto: UpdateMinistryGroupNameDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetMinistryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
        {
          parentMinistryGroup: true,
        },
      );

    await this.ministryGroupsDomainService.updateMinistryGroupName(
      church,
      targetMinistryGroup,
      dto,
      qr,
    );

    const updatedMinistryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupById(
        church,
        targetMinistryGroup.id,
        qr,
      );

    return new MinistryGroupPatchResponseDto(updatedMinistryGroup);
  }

  async deleteMinistryGroup(
    churchId: number,
    ministryGroupId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetMinistryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
        { parentMinistryGroup: true, ministries: true },
      );

    await this.ministryGroupsDomainService.deleteMinistryGroup(
      church,
      targetMinistryGroup,
      qr,
    );

    await this.churchesDomainService.decrementManagementCount(
      church,
      ManagementCountType.MINISTRY_GROUP,
      qr,
    );

    return new MinistryGroupDeleteResponseDto(
      new Date(),
      targetMinistryGroup.id,
      targetMinistryGroup.name,
      true,
    );
  }

  async getMinistryGroupsCascade(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministryGroupsDomainService.findChildMinistryGroups(
      church,
      ministryGroupId,
      qr,
    );
  }

  async refreshMinistryGroupCount(church: ChurchModel, qr: QueryRunner) {
    const ministryGroupCount =
      await this.ministryGroupsDomainService.countAllMinistryGroups(church, qr);

    await this.churchesDomainService.refreshManagementCount(
      church,
      ManagementCountType.MINISTRY_GROUP,
      ministryGroupCount,
      qr,
    );

    return { ministryGroupCount };
  }

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
    await this.membersDomainService.updateMinistryGroupRole(
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

    const members = await this.membersDomainService.findMinistryGroupMembers(
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
      await this.membersDomainService.findMinistryGroupMembersByIds(
        ministryGroup,
        memberIds,
        qr,
      );

    console.log(members);

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

    await this.membersDomainService.updateMinistryGroupRole(
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

  async updateMinistryGroupLeader(
    churchId: number,
    ministryGroupId: number,
    dto: UpdateMinistryGroupLeaderDto,
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

    if (ministryGroup.leaderMemberId === dto.newMinistryGroupLeaderId) {
      throw new BadRequestException('이미 사역그룹장으로 지정된 교인입니다.');
    }

    // 이전 사역그룹장
    const oldLeaderMember = ministryGroup.leaderMemberId
      ? await this.membersDomainService.findMemberModelById(
          church,
          ministryGroup.leaderMemberId,
        )
      : null;

    const newLeaderMember =
      await this.membersDomainService.findMinistryGroupMemberModel(
        ministryGroup,
        dto.newMinistryGroupLeaderId,
        qr,
      );

    await this.membersDomainService.updateMinistryGroupRole(
      [newLeaderMember],
      GroupRole.LEADER,
      qr,
    );

    await this.ministryGroupsDomainService.updateMinistryGroupLeader(
      ministryGroup,
      newLeaderMember,
      qr,
    );

    newLeaderMember.ministryGroupRole = GroupRole.LEADER;

    if (oldLeaderMember) {
      await this.membersDomainService.updateMinistryGroupRole(
        [oldLeaderMember],
        GroupRole.MEMBER,
        qr,
      );
    }

    return { data: newLeaderMember, timestamp: new Date() };
  }
}
