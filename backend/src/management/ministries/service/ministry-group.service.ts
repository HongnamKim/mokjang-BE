import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MinistryGroupModel } from '../entity/ministry-group.entity';
import { QueryRunner } from 'typeorm';
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
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import { GroupRole } from '../../groups/const/group-role.enum';
import { UpdateMinistryGroupLeaderDto } from '../dto/ministry-group/request/update-ministry-group-leader.dto';
import {
  IMINISTRY_MEMBERS_DOMAIN_SERVICE,
  IMinistryMembersDomainService,
} from '../../../members/member-domain/interface/ministry-members-domain.service.interface';
import { GetUnassignedMembersDto } from '../dto/ministry-group/request/member/get-unassigned-members.dto';
import {
  IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupHistoryDomainService,
} from '../../../member-history/ministry-history/ministry-history-domain/interface/ministry-group-history-domain.service.interface';
import {
  IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupDetailHistoryDomainService,
} from '../../../member-history/ministry-history/ministry-history-domain/interface/ministry-group-detail-history-domain.service.interface';
import {
  convertHistoryEndDate,
  convertHistoryStartDate,
} from '../../../member-history/history-date.utils';
import { TIME_ZONE } from '../../../common/const/time-zone.const';

@Injectable()
export class MinistryGroupService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,

    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IMINISTRY_MEMBERS_DOMAIN_SERVICE)
    private readonly ministryMemberDomainService: IMinistryMembersDomainService,
    @Inject(IMINISTRY_MEMBERS_DOMAIN_SERVICE)
    private readonly ministryMembersDomainService: IMinistryMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupHistoryDomainService: IMinistryGroupHistoryDomainService,
    @Inject(IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupDetailHistoryDomainService: IMinistryGroupDetailHistoryDomainService,
    /*@Inject(IMINISTRY_GROUP_ROLE_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupRoleHistoryDomainService: IMinistryGroupRoleHistoryDomainService,*/
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
        { leaderMember: true },
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
      await this.ministryMembersDomainService.findMinistryGroupMemberModelById(
        ministryGroup,
        dto.newMinistryGroupLeaderId,
        qr,
      );

    await this.ministryMembersDomainService.updateMinistryGroupRole(
      [newLeaderMember],
      GroupRole.LEADER,
      qr,
    );

    const newLeaderHistory =
      await this.ministryGroupHistoryDomainService.findCurrentMinistryGroupHistory(
        newLeaderMember,
        ministryGroup,
        qr,
      );

    const startDate = convertHistoryStartDate(dto.startDate, TIME_ZONE.SEOUL);

    await this.ministryGroupDetailHistoryDomainService.startMinistryGroupRoleHistory(
      newLeaderMember,
      newLeaderHistory,
      startDate,
      qr,
    );

    /*await this.ministryGroupRoleHistoryDomainService.startMinistryGroupRoleHistory(
      newLeaderHistory,
    );*/

    await this.ministryGroupsDomainService.updateMinistryGroupLeader(
      ministryGroup,
      newLeaderMember,
      qr,
    );

    newLeaderMember.ministryGroupRole = GroupRole.LEADER;

    if (oldLeaderMember) {
      const endDate = convertHistoryEndDate(dto.startDate, TIME_ZONE.SEOUL);

      // 다른 사역 그룹에서도 리더인지 확인
      const leaderGroups =
        await this.ministryGroupsDomainService.findMinistryGroupsByLeaderMember(
          oldLeaderMember,
          qr,
        );

      if (leaderGroups.length === 0) {
        // 리더인 사역그룹이 없을 경우 ministryGroupRole 을 Member 로 변경
        await this.ministryMembersDomainService.updateMinistryGroupRole(
          [oldLeaderMember],
          GroupRole.MEMBER,
          qr,
        );
      }

      const oldLeaderHistory =
        await this.ministryGroupHistoryDomainService.findCurrentMinistryGroupHistory(
          oldLeaderMember,
          ministryGroup,
          qr,
        );

      const currentRoleHistory =
        await this.ministryGroupDetailHistoryDomainService.findCurrentRoleHistory(
          oldLeaderHistory,
          qr,
        );

      // TODO 기존 사역리더 이력 종료
      await this.ministryGroupDetailHistoryDomainService.endMinistryGroupRoleHistory(
        currentRoleHistory,
        endDate,
        qr,
      );
    }

    return { data: newLeaderMember, timestamp: new Date() };
  }

  async getUnassignedMembers(churchId: number, dto: GetUnassignedMembersDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const unassignedMembers =
      await this.ministryMemberDomainService.findUnassignedMembers(church, dto);

    return {
      data: unassignedMembers,
      timestamp: new Date(),
    };
  }
}
