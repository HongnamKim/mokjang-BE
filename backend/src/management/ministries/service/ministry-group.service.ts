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
import { PostMinistryGroupResponseDto } from '../dto/ministry-group/response/post-ministry-group-response.dto';
import { PatchMinistryGroupResponseDto } from '../dto/ministry-group/response/patch-ministry-group-response.dto';
import { DeleteMinistryGroupResponseDto } from '../dto/ministry-group/response/delete-ministry-group-response.dto';
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
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import {
  IMEMBER_FILTER_SERVICE,
  IMemberFilterService,
} from '../../../members/service/interface/member-filter.service.interface';
import { RefreshMinistryGroupCountResponseDto } from '../dto/ministry-group/response/refresh-ministry-group-count-response.dto';
import { PatchMinistryGroupLeaderResponseDto } from '../dto/ministry-group/response/patch-ministry-group-leader-response.dto';
import { GetUnassignedMemberResponseDto } from '../dto/ministry-group/response/get-unassigned-member-response.dto';

@Injectable()
export class MinistryGroupService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,

    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IMEMBER_FILTER_SERVICE)
    private readonly memberFilterService: IMemberFilterService,
    @Inject(IMINISTRY_MEMBERS_DOMAIN_SERVICE)
    private readonly ministryMemberDomainService: IMinistryMembersDomainService,
    @Inject(IMINISTRY_MEMBERS_DOMAIN_SERVICE)
    private readonly ministryMembersDomainService: IMinistryMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupHistoryDomainService: IMinistryGroupHistoryDomainService,
    @Inject(IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupDetailHistoryDomainService: IMinistryGroupDetailHistoryDomainService,
  ) {}

  async getMinistryGroups(church: ChurchModel, dto: GetMinistryGroupDto) {
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

    return new MinistryGroupPaginationResultDto(result);
  }

  async getMinistryGroupById(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    return this.ministryGroupsDomainService.findMinistryGroupById(
      church,
      ministryGroupId,
      qr,
    );
  }

  async createMinistryGroup(
    church: ChurchModel,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
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

    return new PostMinistryGroupResponseDto(newMinistryGroup);
  }

  async updateMinistryGroupStructure(
    church: ChurchModel,
    ministryGroupId: number,
    dto: UpdateMinistryGroupStructureDto,
    qr: QueryRunner,
  ) {
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

    return new PatchMinistryGroupResponseDto(updatedMinistryGroup);
  }

  async updateMinistryGroupName(
    church: ChurchModel,
    ministryGroupId: number,
    dto: UpdateMinistryGroupNameDto,
    qr: QueryRunner,
  ) {
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

    return new PatchMinistryGroupResponseDto(updatedMinistryGroup);
  }

  async deleteMinistryGroup(
    church: ChurchModel,
    ministryGroupId: number,
    qr: QueryRunner,
  ) {
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

    return new DeleteMinistryGroupResponseDto(
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

    return new RefreshMinistryGroupCountResponseDto(ministryGroupCount);
  }

  async updateMinistryGroupLeader(
    church: ChurchModel,
    ministryGroupId: number,
    dto: UpdateMinistryGroupLeaderDto,
    qr: QueryRunner,
  ) {
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

    return new PatchMinistryGroupLeaderResponseDto(newLeaderMember);
  }

  async getUnassignedMembers(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    dto: GetUnassignedMembersDto,
  ) {
    const unassignedMembers =
      await this.ministryMemberDomainService.findUnassignedMembers(church, dto);

    const scope = await this.memberFilterService.getScopeGroupIds(
      church,
      requestManager,
    );

    const filteredMember = this.memberFilterService.filterMembers(
      requestManager,
      unassignedMembers,
      scope,
    );

    return new GetUnassignedMemberResponseDto(filteredMember);
  }
}
