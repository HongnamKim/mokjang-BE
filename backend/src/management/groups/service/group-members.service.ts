import { Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../groups-domain/interface/groups-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import { GetGroupMembersDto } from '../dto/request/members/get-group-members.dto';
import { GetGroupMembersResponseDto } from '../dto/response/members/get-group-members-response.dto';
import {
  IGROUP_MEMBERS_DOMAIN_SERVICE,
  IGroupMembersDomainService,
} from '../../../members/member-domain/interface/group-members.domain.service.interface';
import { AddMembersToGroupDto } from '../dto/request/members/add-members-to-group.dto';
import { QueryRunner } from 'typeorm';
import { AddMemberConflictException } from '../../../common/exception/add-conflict.exception';
import { MemberException } from '../../../members/exception/member.exception';
import { AddMembersToGroupResponseDto } from '../dto/response/members/add-members-to-group-response.dto';
import { MemberModel } from '../../../members/entity/member.entity';
import { GroupModel } from '../entity/group.entity';
import { RemoveMembersFromGroupDto } from '../dto/request/members/remove-members-from-group.dto';
import { RemoveMembersFromGroupResponseDto } from '../dto/response/members/remove-members-from-group-response.dto';
import { GroupRole } from '../const/group-role.enum';
import {
  IGROUP_HISTORY_DOMAIN_SERVICE,
  IGroupHistoryDomainService,
} from '../../../member-history/group-history/group-history-domain/interface/group-history-domain.service.interface';
import {
  convertHistoryEndDate,
  convertHistoryStartDate,
} from '../../../member-history/history-date.utils';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { ChurchModel } from '../../../churches/entity/church.entity';

@Injectable()
export class GroupMembersService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IGROUP_MEMBERS_DOMAIN_SERVICE)
    private readonly groupMembersDomainService: IGroupMembersDomainService,
    @Inject(IGROUP_HISTORY_DOMAIN_SERVICE)
    private readonly groupHistoryDomainService: IGroupHistoryDomainService,
  ) {}

  async getGroupMembers(
    churchId: number,
    groupId: number,
    dto: GetGroupMembersDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
    );

    const groupMembers = await this.groupMembersDomainService.findGroupMembers(
      church,
      group,
      dto,
    );

    return new GetGroupMembersResponseDto(groupMembers);
  }

  async addMembersToGroup(
    churchId: number,
    groupId: number,
    dto: AddMembersToGroupDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
    );

    const members = await this.membersDomainService.findMembersById(
      church,
      dto.memberIds,
      qr,
      { group: true },
    );

    const sameGroupMembers = members.filter(
      (member) => member.groupId === groupId,
    );

    if (sameGroupMembers.length > 0) {
      throw new AddMemberConflictException(
        MemberException.ALREADY_SAME_GROUP,
        sameGroupMembers.map((member) => ({
          id: member.id,
          name: member.name,
        })),
      );
    }

    // 그룹을 옮기는 교인 처리
    const changeGroupMembers = members.filter((member) => member.groupId);
    if (changeGroupMembers.length > 0) {
      // 교인 수 감소
      await this.decrementOldGroups(church, changeGroupMembers, qr);

      // 리더였던 교인 처리
      const oldGroupLeaderMembers = changeGroupMembers.filter(
        (member) => member.groupRole === GroupRole.LEADER,
      );
      const leaderLostGroups = oldGroupLeaderMembers.map(
        (member) => member.group,
      );
      await this.groupsDomainService.removeGroupLeader(leaderLostGroups, qr);

      const endDate = convertHistoryEndDate(dto.startDate, TIME_ZONE.SEOUL);

      // 기존 그룹 이력 종료 처리
      for (const member of changeGroupMembers) {
        const groupSnapShot =
          await this.groupsDomainService.getGroupNameWithHierarchy(
            church,
            member.group,
            qr,
          );

        await this.groupHistoryDomainService.endGroupHistories(
          [member],
          endDate,
          qr,
          member.group,
          groupSnapShot,
        );
      }
    }

    // 교인에게 그룹 부여
    await this.groupMembersDomainService.assignGroup(members, group, qr);

    await this.groupsDomainService.incrementMembersCount(
      group,
      members.length,
      qr,
    );

    // 새로운 그룹 이력 시작
    await this.groupHistoryDomainService.startGroupHistories(
      members,
      group,
      convertHistoryStartDate(dto.startDate, TIME_ZONE.SEOUL),
      qr,
    );

    group.membersCount += members.length;

    return new AddMembersToGroupResponseDto(group);
  }

  private async decrementOldGroups(
    church: ChurchModel,
    changeGroupMembers: MemberModel[],
    qr: QueryRunner,
  ) {
    const groupDecrementMap = new Map<
      number,
      { group: GroupModel; count: number; groupSnapShot: string }
    >();

    for (const member of changeGroupMembers) {
      const groupId = member.groupId as number;
      const existing = groupDecrementMap.get(groupId);

      if (existing) {
        existing.count++;
      } else {
        const groupSnapShot =
          await this.groupsDomainService.getGroupNameWithHierarchy(
            church,
            member.group,
            qr,
          );
        groupDecrementMap.set(groupId, {
          group: member.group,
          count: 1,
          groupSnapShot,
        });
      }
    }

    for (const { group, count } of groupDecrementMap.values()) {
      await this.groupsDomainService.decrementMembersCount(group, count, qr);
    }

    return groupDecrementMap;
  }

  async removeMembersFromGroup(
    churchId: number,
    groupId: number,
    dto: RemoveMembersFromGroupDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
    );

    const removeMembers =
      await this.groupMembersDomainService.findGroupMembersByIds(
        church,
        group,
        dto.memberIds,
        qr,
      );

    await this.groupMembersDomainService.removeGroup(removeMembers, qr);

    await this.groupsDomainService.decrementMembersCount(
      group,
      removeMembers.length,
      qr,
    );

    // 리더가 나가는 경우 리더 없애기
    if (removeMembers.some((member) => member.groupRole === GroupRole.LEADER)) {
      await this.groupsDomainService.removeGroupLeader([group], qr);

      group.leaderMemberId = null;
    }

    const endDate = convertHistoryEndDate(dto.endDate, TIME_ZONE.SEOUL);
    // TODO 그룹 이력 종료 처리
    const groupSnapShot =
      await this.groupsDomainService.getGroupNameWithHierarchy(
        church,
        group,
        qr,
      );

    await this.groupHistoryDomainService.endGroupHistories(
      removeMembers,
      endDate,
      qr,
      group,
      groupSnapShot,
    );

    group.membersCount -= removeMembers.length;

    return new RemoveMembersFromGroupResponseDto(group);
  }

  async refreshMembersCount(churchId: number, groupId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
    );

    const membersCount = await this.groupMembersDomainService.countAllMembers(
      church,
      group,
    );

    await this.groupsDomainService.refreshMembersCount(group, membersCount);

    group.membersCount = membersCount;

    return { data: group, timestamp: new Date() };
  }
}
