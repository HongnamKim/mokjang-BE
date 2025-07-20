import { Inject, Injectable } from '@nestjs/common';
import { GroupModel } from '../entity/group.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
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
import { GroupPaginationResultDto } from '../dto/response/group-pagination-result.dto';
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
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { startOfDay } from 'date-fns';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { GroupRole } from '../const/group-role.enum';
import { GetGroupMembersDto } from '../dto/request/get-group-members.dto';
import { GetGroupMembersResponseDto } from '../dto/response/get-group-members-response.dto';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,

    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IGROUP_HISTORY_DOMAIN_SERVICE)
    private readonly groupHistoryDomainService: IGroupHistoryDomainService,
  ) {}

  async getGroups(churchId: number, dto: GetGroupDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { data, totalCount } = await this.groupsDomainService.findGroups(
      church,
      dto,
    );

    return new GroupPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getGroupModelById(
    churchId: number,
    groupId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupModel>,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
      relationOptions,
    );
  }

  async getGroupByIdWithParents(
    churchId: number,
    groupId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.groupsDomainService.findGroupByIdWithParents(
      church,
      groupId,
      qr,
    );
  }

  async createGroup(churchId: number, dto: CreateGroupDto, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

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

    const oldLeaderMember = group.leaderMemberId
      ? await this.membersDomainService.findMemberModelById(
          church,
          group.leaderMemberId,
          qr,
        )
      : null;

    const newLeaderMember = await this.membersDomainService.findMemberModelById(
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
    await this.membersDomainService.updateGroupRole(group, newLeaderMember, qr);

    const now = new Date();

    const today = fromZonedTime(
      startOfDay(toZonedTime(now, TIME_ZONE.SEOUL)),
      TIME_ZONE.SEOUL,
    );

    const parentGroups = await this.groupsDomainService.findParentGroups(
      church,
      group,
      qr,
    );

    const groupSnapShot = parentGroups
      .map((parentGroup) => parentGroup.name)
      .concat(group.name)
      .join('__');

    // 그룹 이력 수정
    if (oldLeaderMember) {
      const oldLeaderMemberGroupHistory =
        await this.groupHistoryDomainService.findCurrentGroupHistoryModel(
          oldLeaderMember,
          qr,
        );

      // 리더 이력 종료
      await this.groupHistoryDomainService.endGroupHistory(
        oldLeaderMemberGroupHistory,
        groupSnapShot,
        today,
        qr,
      );
      // 그룹원 이력 시작
      await this.groupHistoryDomainService.createGroupHistory(
        oldLeaderMember,
        group,
        GroupRole.MEMBER,
        today,
        qr,
      );
    }
    const newLeaderGroupHistory =
      await this.groupHistoryDomainService.findCurrentGroupHistoryModel(
        newLeaderMember,
        qr,
      );

    // 그룹원 이력 종료
    await this.groupHistoryDomainService.endGroupHistory(
      newLeaderGroupHistory,
      groupSnapShot,
      today,
      qr,
    );
    // 리더 이력 시작
    await this.groupHistoryDomainService.createGroupHistory(
      newLeaderMember,
      group,
      GroupRole.LEADER,
      today,
      qr,
    );
  }

  async updateGroupStructure(
    churchId: number,
    groupId: number,
    dto: UpdateGroupStructureDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

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
    churchId: number,
    groupId: number,
    dto: UpdateGroupNameDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

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

  async deleteGroup(churchId: number, groupId: number, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
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

    return { groupCount };
  }

  /*async getParentGroups(churchId: number, groupId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const group = await this.groupsDomainService.findGroupById(
      church,
      groupId,
      qr,
    );

    return this.groupsDomainService.findParentGroups(church, group, qr);
  }*/

  /*async getChildGroupIds(churchId: number, groupId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const group = await this.groupsDomainService.findGroupById(
      church,
      groupId,
      qr,
    );

    return this.groupsDomainService.findChildGroups(group, qr);
  }*/

  /*async getGroupsByName(
    churchId: number,
    dto: GetGroupByNameDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const { data, totalCount } =
      await this.groupsDomainService.findGroupsByName(church, dto, qr);

    return new GroupPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }*/
  async getGroupMembers(
    church: ChurchModel,
    groupId: number,
    dto: GetGroupMembersDto,
  ) {
    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
    );

    const groupMembers = await this.membersDomainService.findGroupMembers(
      church,
      group,
      dto,
    );

    return new GetGroupMembersResponseDto(groupMembers);
  }
}
