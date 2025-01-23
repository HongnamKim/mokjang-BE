import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupHistoryModel } from '../entity/group-history.entity';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { MembersService } from '../../members/service/members.service';
import { GroupsService } from '../../management/service/group/groups.service';
import { GetGroupHistoryDto } from '../dto/group/get-group-history.dto';
import { AddMemberToGroupDto } from '../dto/group/add-member-to-group.dto';
import { UpdateGroupHistoryDto } from '../dto/group/update-group-history.dto';
import { DefaultMemberRelationOption } from '../../members/const/default-find-options.const';
import { EndMemberGroupDto } from '../dto/group/end-member-group.dto';

@Injectable()
export class GroupHistoryService {
  constructor(
    @InjectRepository(GroupHistoryModel)
    private readonly groupHistoryRepository: Repository<GroupHistoryModel>,
    private readonly membersService: MembersService,
    private readonly groupsService: GroupsService,
  ) {}

  private getGroupHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(GroupHistoryModel)
      : this.groupHistoryRepository;
  }

  async getMemberGroupHistory(
    churchId: number,
    memberId: number,
    dto: GetGroupHistoryDto,
    qr?: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const groupHistories = await groupHistoryRepository.find({
      where: {
        member: {
          churchId,
        },
        memberId,
      },
      relations: {
        group: true,
        groupRole: true,
      },
      order: {
        endDate: dto.orderDirection,
        startDate: dto.orderDirection,
        id: dto.orderDirection,
      },
    });

    return Promise.all(
      groupHistories.map(async (groupHistory) => {
        if (groupHistory.endDate) {
          return { ...groupHistory };
        }

        const groupId = groupHistory.groupId;

        const parentGroups = groupId
          ? await this.groupsService.getParentGroups(churchId, groupId, qr)
          : [];

        const groupSnapShot = parentGroups
          .map((parentGroup) => parentGroup.name)
          .concat(groupHistory.group.name)
          .join('__');

        const groupRoleSnapShot = groupHistory.groupRole
          ? groupHistory.groupRole.role
          : null;

        groupHistory.groupSnapShot = groupSnapShot;
        groupHistory.groupRoleSnapShot = groupRoleSnapShot;

        return {
          ...groupHistory,
          group: null,
          groupRole: null,
        };
      }),
    );
  }

  // 등록하려는 그룹이 교회에 존재하는지
  // 교인이 교회에 존재하는지
  // 그룹 역할이 있을 경우 해당 역할이 그룹에 존재하는지
  async addMemberToGroup(
    churchId: number,
    memberId: number,
    dto: AddMemberToGroupDto,
    qr: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    // 그룹 검증
    const group = await this.groupsService.getGroupModelById(
      churchId,
      dto.groupId,
      qr,
      { groupRoles: true },
    );

    // 교인 검증
    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { group: true },
      qr,
    );
    // 기존 그룹 여부 검증
    if (member.group) {
      throw new BadRequestException('해당 교인은 이미 소속된 그룹이 있습니다.');
    }
    /*if (member.group && dto.autoEndGroup) {
        // 기존 그룹 종료 로직 수행
      }*/

    const groupRole = dto.groupRoleId
      ? group.groupRoles.filter(
          (groupRole) => groupRole.id === dto.groupRoleId,
        )[0]
      : undefined;

    if (dto.groupRoleId && !groupRole) {
      throw new NotFoundException('해당 그룹에 존재하지 않는 역할입니다.');
    }

    // 이력 생성
    await groupHistoryRepository.save({
      member,
      group,
      groupRole,
      startDate: dto.startDate,
    });

    // 그룹의 인원 수 증가
    await this.groupsService.incrementMembersCount(dto.groupId, qr);

    // 교인의 그룹 정보 업데이트
    await this.membersService.addMemberGroup(member, group, groupRole, qr);

    return this.membersService.getMemberById(
      churchId,
      memberId,
      DefaultMemberRelationOption,
      qr,
    );
  }

  async endMemberGroup(
    churchId: number,
    memberId: number,
    dto: EndMemberGroupDto,
    qr: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const groupHistory = await groupHistoryRepository.findOne({
      where: {
        member: {
          churchId,
        },
        memberId,
        endDate: IsNull(),
      },
      relations: {
        group: true,
        groupRole: true,
      },
    });

    if (!groupHistory) {
      throw new NotFoundException('그룹에 소속되지 않은 교인입니다.');
    }

    if (groupHistory.startDate > dto.endDate) {
      throw new BadRequestException('그룹 종료일이 시작일을 앞설 수 없습니다.');
    }

    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { group: true },
      qr,
    );

    const { group, groupRole } = groupHistory;

    const parentGroups = group.parentGroupId
      ? await this.groupsService.getParentGroups(churchId, group.id, qr)
      : [];

    const groupSnapShot = parentGroups
      .map((parentGroup) => parentGroup.name)
      .concat(group.name)
      .join('__');

    // 그룹 이력 종료 날짜 추가, 스냅샷 추가
    await groupHistoryRepository.update(
      {
        memberId,
      },
      {
        groupId: null,
        groupRoleId: null,
        groupRoleSnapShot: groupRole?.role,
        groupSnapShot,
        endDate: dto.endDate,
      },
    );

    // MemberModel, GroupModel, GroupRoleModel relation 해제
    await this.membersService.removeMemberGroup(member, qr);

    await this.groupsService.decrementMembersCount(group.id, qr);

    return this.membersService.getMemberById(
      churchId,
      memberId,
      DefaultMemberRelationOption,
      qr,
    );
  }

  async updateGroupHistory(
    churchId: number,
    memberId: number,
    groupHistoryId: number,
    dto: UpdateGroupHistoryDto,
    qr: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const targetHistory = await groupHistoryRepository.findOne({
      where: {
        member: {
          churchId,
        },
        memberId,
        id: groupHistoryId,
      },
    });

    if (!targetHistory) {
      throw new NotFoundException('해당 그룹 이력을 찾을 수 없습니다.');
    }

    if (targetHistory.endDate === null && dto.endDate) {
      throw new BadRequestException(
        '종료되지 않은 그룹의 종료 날짜를 수정할 수 없습니다.',
      );
    }

    if (dto.startDate && !dto.endDate) {
      if (targetHistory.endDate && dto.startDate > targetHistory.endDate) {
        throw new BadRequestException(
          '이력 시작일은 종료일보다 늦을 수 없습니다.',
        );
      }
    }

    if (dto.endDate && !dto.startDate) {
      if (dto.endDate < targetHistory.startDate) {
        throw new BadRequestException(
          '이력 종료일은 시작일보다 빠를 수 없습니다.',
        );
      }
    }

    await groupHistoryRepository.update(
      {
        id: groupHistoryId,
      },
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    );

    return groupHistoryRepository.findOne({ where: { id: groupHistoryId } });
  }

  async deleteGroupHistory(
    churchId: number,
    memberId: number,
    groupHistoryId: number,
    qr?: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const targetHistory = await groupHistoryRepository.findOne({
      where: {
        id: groupHistoryId,
        member: {
          churchId,
        },
        memberId,
      },
    });

    if (!targetHistory) {
      throw new NotFoundException('해당 그룹 이력을 찾을 수 없습니다.');
    }

    if (targetHistory.endDate === null) {
      throw new BadRequestException('종료되지 않은 이력을 삭제할 수 없습니다.');
    }

    await groupHistoryRepository.softDelete(targetHistory.id);

    return `groupHistoryId ${groupHistoryId} deleted`;
  }
}
