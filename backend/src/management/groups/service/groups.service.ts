import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { GroupModel } from '../entity/group.entity';
import { QueryRunner } from 'typeorm';
import { CreateGroupDto } from '../dto/request/create-group.dto';
import { UpdateGroupNameDto } from '../dto/request/update-group-name.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../groups-domain/interface/groups-domain.service.interface';
import { GetGroupDto } from '../dto/request/get-group.dto';
import { GroupPaginationResponseDto } from '../dto/response/group-pagination-response.dto';
import { GroupDeleteResponseDto } from '../dto/response/group-delete-response.dto';
import { UpdateGroupStructureDto } from '../dto/request/update-group-structure.dto';
import {
  ChurchModel,
  ManagementCountType,
} from '../../../churches/entity/church.entity';
import { UpdateGroupLeaderDto } from '../dto/request/update-group-leader.dto';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import {
  IGROUP_HISTORY_DOMAIN_SERVICE,
  IGroupHistoryDomainService,
} from '../../../member-history/group-history/group-history-domain/interface/group-history-domain.service.interface';
import { GetUnassignedMembersDto } from '../../ministries/dto/ministry-group/request/member/get-unassigned-members.dto';
import { UnassignedMembersResponseDto } from '../../officers/dto/response/members/unassigned-members-response.dto';
import {
  IGROUP_MEMBERS_DOMAIN_SERVICE,
  IGroupMembersDomainService,
} from '../../../members/member-domain/interface/group-members.domain.service.interface';
import {
  IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
  IGroupDetailHistoryDomainService,
} from '../../../member-history/group-history/group-history-domain/interface/group-detail-history-domain.service.interface';
import { GroupRole } from '../const/group-role.enum';
import {
  convertHistoryEndDate,
  convertHistoryStartDate,
} from '../../../member-history/history-date.utils';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import {
  IMEMBER_FILTER_SERVICE,
  IMemberFilterService,
} from '../../../members/service/interface/member-filter.service.interface';
import { RefreshGroupCountResponseDto } from '../dto/response/refresh-group-count-response.dto';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBER_FILTER_SERVICE)
    private readonly memberFilterService: IMemberFilterService,

    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IGROUP_MEMBERS_DOMAIN_SERVICE)
    private readonly groupMembersDomainService: IGroupMembersDomainService,
    @Inject(IGROUP_HISTORY_DOMAIN_SERVICE)
    private readonly groupHistoryDomainService: IGroupHistoryDomainService,
    @Inject(IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE)
    private readonly groupDetailHistoryDomainService: IGroupDetailHistoryDomainService,
  ) {}

  async getGroups(church: ChurchModel, dto: GetGroupDto) {
    const data = await this.groupsDomainService.findGroups(church, dto);

    return new GroupPaginationResponseDto(data);
  }

  async getGroupById(church: ChurchModel, groupId: number, qr?: QueryRunner) {
    return this.groupsDomainService.findGroupById(church, groupId, qr);
  }

  async getGroupByIdWithParents(
    church: ChurchModel,
    groupId: number,
    qr?: QueryRunner,
  ) {
    return this.groupsDomainService.findGroupByIdWithParents(
      church,
      groupId,
      qr,
    );
  }

  async createGroup(church: ChurchModel, dto: CreateGroupDto, qr: QueryRunner) {
    await this.churchesDomainService.incrementManagementCount(
      church,
      ManagementCountType.GROUP,
      qr,
    );

    return this.groupsDomainService.createGroup(church, dto, qr);
  }

  async updateGroupLeader(
    church: ChurchModel,
    groupId: number,
    dto: UpdateGroupLeaderDto,
    qr: QueryRunner,
  ) {
    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
    );

    if (dto.newLeaderMemberId !== 0) {
      const newLeaderMember =
        await this.membersDomainService.findMemberModelById(
          church,
          dto.newLeaderMemberId,
          qr,
        );

      // 그룹의 리더 설정 (group.leaderMemberId)
      await this.groupsDomainService.updateGroupLeader(
        group,
        newLeaderMember,
        qr,
      );

      // 교인의 groupRole 설정 (member.groupRole), 기존 리더가 있을 경우 GroupRole.MEMBER 로 변경
      await this.membersDomainService.updateGroupRole(
        newLeaderMember,
        GroupRole.LEADER,
        qr,
      );
      const newLeaderGroupHistory =
        await this.groupHistoryDomainService.findCurrentGroupHistoryModel(
          newLeaderMember,
          qr,
        );
      await this.groupDetailHistoryDomainService.startGroupDetailHistory(
        newLeaderMember,
        newLeaderGroupHistory,
        GroupRole.LEADER,
        convertHistoryStartDate(dto.startDate, TIME_ZONE.SEOUL),
        qr,
      );
    }

    const oldLeaderMember = group.leaderMemberId
      ? await this.membersDomainService.findMemberModelById(
          church,
          group.leaderMemberId,
          qr,
        )
      : null;

    if (oldLeaderMember) {
      await this.membersDomainService.updateGroupRole(
        oldLeaderMember,
        GroupRole.MEMBER,
        qr,
      );

      const oldLeaderHistory =
        await this.groupHistoryDomainService.findCurrentGroupHistoryModel(
          oldLeaderMember,
          qr,
        );
      const oldLeaderDetailHistory =
        await this.groupDetailHistoryDomainService.findCurrentGroupDetailHistory(
          oldLeaderMember,
          oldLeaderHistory,
          qr,
        );

      const endDate = convertHistoryEndDate(dto.startDate, TIME_ZONE.SEOUL);

      if (oldLeaderDetailHistory.startDate > endDate) {
        const prevStartDate = format(
          toZonedTime(oldLeaderDetailHistory.startDate, TIME_ZONE.SEOUL),
          'yyyy-MM-dd',
        );

        throw new BadRequestException(
          `이전 리더의 이력의 시작일과 새로운 리더의 시작일이 맞지 않습니다. (이전 리더 시작일: ${prevStartDate})`,
        );
      }

      await this.groupDetailHistoryDomainService.endGroupDetailHistory(
        [oldLeaderMember],
        endDate,
        qr,
      );
    }

    if (dto.newLeaderMemberId === 0) {
      await this.groupsDomainService.updateGroupLeader(group, null, qr);
    }

    return this.groupsDomainService.findGroupById(church, groupId, qr);
  }

  async updateGroupStructure(
    church: ChurchModel,
    groupId: number,
    dto: UpdateGroupStructureDto,
    qr: QueryRunner,
  ) {
    /*const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );*/

    const targetGroup = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
      { parentGroup: true },
    );

    let newParentGroup: GroupModel | null;

    if (dto.parentGroupId === undefined) {
      newParentGroup = targetGroup.parentGroup;
    } else if (dto.parentGroupId === null) {
      newParentGroup = null;
    } else {
      newParentGroup = await this.groupsDomainService.findGroupModelById(
        church,
        dto.parentGroupId,
        qr,
      );
    }

    await this.groupsDomainService.updateGroupStructure(
      church,
      targetGroup,
      dto,
      qr,
      newParentGroup,
    );

    return this.groupsDomainService.findGroupById(church, targetGroup.id, qr);
  }

  async updateGroupName(
    church: ChurchModel,
    groupId: number,
    dto: UpdateGroupNameDto,
    qr: QueryRunner,
  ) {
    /*const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );*/

    const targetGroup = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
      { parentGroup: true },
    );

    await this.groupsDomainService.updateGroupName(
      church,
      targetGroup,
      dto,
      qr,
    );

    return this.groupsDomainService.findGroupById(church, targetGroup.id, qr);
  }

  async deleteGroup(church: ChurchModel, groupId: number, qr: QueryRunner) {
    /*const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );*/
    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
      {
        parentGroup: true,
      },
    );

    await this.groupsDomainService.deleteGroup(group, qr);
    await this.churchesDomainService.decrementManagementCount(
      church,
      ManagementCountType.GROUP,
      qr,
    );

    return new GroupDeleteResponseDto(new Date(), groupId, group.name, true);
  }

  async refreshGroupCount(church: ChurchModel, qr: QueryRunner) {
    const groupCount = await this.groupsDomainService.countAllGroups(
      church,
      qr,
    );

    await this.churchesDomainService.refreshManagementCount(
      church,
      ManagementCountType.GROUP,
      groupCount,
      qr,
    );

    return new RefreshGroupCountResponseDto(groupCount);
  }

  async getUnassignedMembers(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    dto: GetUnassignedMembersDto,
  ) {
    const members = await this.groupMembersDomainService.findUnassignedMembers(
      church,
      dto,
    );

    const scope = await this.memberFilterService.getScopeGroupIds(
      church,
      requestManager,
    );

    const filteredMember = this.memberFilterService.filterMembers(
      requestManager,
      members,
      scope,
    );

    return new UnassignedMembersResponseDto(filteredMember);
  }
}
