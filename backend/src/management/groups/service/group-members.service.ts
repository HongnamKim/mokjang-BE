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
import { GetGroupMembersResponseDto } from '../dto/response/get-group-members-response.dto';
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

    const changeGroupMembers = members.filter((member) => member.groupId);
    if (changeGroupMembers.length > 0) {
      // 교인 수 감소
      await this.decrementOldGroups(changeGroupMembers, qr);

      // 리더였던 교인 처리
      const oldGroupLeaderMembers = changeGroupMembers.filter(
        (member) => member.groupRole === GroupRole.LEADER,
      );
      const targetGroup = oldGroupLeaderMembers.map((member) => member.group);
      await this.groupsDomainService.removeGroupLeader(targetGroup, qr);

      // TODO 기존 그룹 이력 종료 처리
    }

    // 교인에게 그룹 부여
    await this.groupMembersDomainService.assignGroup(members, group, qr);

    await this.groupsDomainService.incrementMembersCount(
      group,
      members.length,
      qr,
    );

    // TODO 새로운 그룹 이력 시작

    group.membersCount += members.length;

    return new AddMembersToGroupResponseDto(group);
  }

  private async decrementOldGroups(
    changeGroupMembers: MemberModel[],
    qr: QueryRunner,
  ) {
    const groupDecrementMap = new Map<
      number,
      { group: GroupModel; count: number }
    >();

    changeGroupMembers.forEach((member) => {
      const groupId = member.groupId as number;
      const existing = groupDecrementMap.get(groupId);

      if (existing) {
        existing.count++;
      } else {
        groupDecrementMap.set(groupId, { group: member.group, count: 1 });
      }
    });

    for (const { group, count } of groupDecrementMap.values()) {
      await this.groupsDomainService.decrementMembersCount(group, count, qr);
    }
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

    // TODO 그룹 이력 종료 처리

    group.membersCount -= removeMembers.length;

    return new RemoveMembersFromGroupResponseDto(group);
  }
}
