import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupHistoryModel } from '../entity/group-history.entity';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { MembersService } from '../../members/service/members.service';
import { GroupsService } from '../../settings/service/groups.service';
import { GetGroupHistoryDto } from '../dto/group/get-group-history.dto';
import { GroupsRolesService } from '../../settings/service/groups-roles.service';
import { CreateGroupHistoryDto } from '../dto/group/create-group-history.dto';
import { UpdateGroupHistoryDto } from '../dto/group/update-group-history.dto';

@Injectable()
export class GroupHistoryService {
  constructor(
    @InjectRepository(GroupHistoryModel)
    private readonly groupHistoryRepository: Repository<GroupHistoryModel>,
    private readonly membersService: MembersService,
    private readonly groupsService: GroupsService,
    private readonly groupsRolesService: GroupsRolesService,
  ) {}

  private getGroupHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(GroupHistoryModel)
      : this.groupHistoryRepository;
  }

  getGroupHistory(churchId: number, memberId: number, dto: GetGroupHistoryDto) {
    return this.groupHistoryRepository.find({
      where: { memberId },
      order: {
        endDate: dto.orderDirection,
        startDate: dto.orderDirection,
        createdAt: dto.orderDirection,
      },
    });
  }

  async getGroupHistoryById(id: number, memberId: number, qr?: QueryRunner) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const groupHistory = await groupHistoryRepository.findOne({
      where: {
        id,
        memberId,
      },
    });

    if (!groupHistory) {
      throw new NotFoundException('해당 그룹 이력이 존재하지 않습니다.');
    }

    return groupHistory;
  }

  async createGroupHistory(
    churchId: number,
    memberId: number,
    dto: CreateGroupHistoryDto,
    qr: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    // 기존 그룹이 있는지 확인
    const existHistory = await groupHistoryRepository.findOne({
      where: {
        memberId,
        endDate: IsNull(),
      },
    });

    // 기존 그룹이 있을 경우 자동으로 종료일 지정
    if (existHistory && dto.autoEndDate) {
      // 그룹 자동 종료
      await groupHistoryRepository.update(
        { id: existHistory.id },
        {
          endDate: dto.startDate,
        },
      );

      // 종료된 그룹의 인원수 감소
      await this.groupsService.decrementMembersCount(existHistory.groupId, qr);
    }

    // 기존 그룹 있을 경우 Exception
    if (existHistory && !dto.autoEndDate) {
      throw new BadRequestException('이미 소속 그룹이 존재하는 교인입니다.');
    }

    this.validateDate(dto);

    const group = await this.groupsService.getGroupById(
      churchId,
      dto.groupId,
      qr,
    );

    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      {},
      qr,
    );

    const groupRole = dto.groupRoleId
      ? await this.groupsRolesService.getGroupRoleById(
          churchId,
          dto.groupId,
          dto.groupRoleId,
          qr,
        )
      : undefined;

    const groupHistory = await groupHistoryRepository.save({
      group: group,
      groupName: group.name,
      groupRoleId: groupRole && groupRole.id,
      groupRoleName: groupRole && groupRole.role,
      member: member,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    await this.groupsService.incrementMembersCount(dto.groupId, qr);

    return groupHistoryRepository.findOne({ where: { id: groupHistory.id } });
  }

  /**
   * update 요소
   *  1. 그룹 -> 바꾸려는 그룹 존재여부 확인, 기존 그룹 인원수 차감, 새로운 그룹 인원수 증가
   *  2. 그룹 내 역할 -> 바꾸려는 역할 존재여부 확인
   *  3. 시작날짜 -> 종료날짜보다 앞에 있는지
   *  4. 종료날짜 -> 시작날짜보다 뒤에 있는지
   */
  async updateGroupHistory(
    churchId: number,
    memberId: number,
    groupHistoryId: number,
    dto: UpdateGroupHistoryDto,
    qr: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const groupHistory = await this.getGroupHistoryById(
      groupHistoryId,
      memberId,
      qr,
    );

    const newGroup = dto.groupId
      ? await this.groupsService.getGroupById(churchId, dto.groupId, qr)
      : undefined;

    // 그룹 변경 시 새 그룹 인원수 증가, 기존 그룹 인원수 감소
    if (newGroup) {
      await this.groupsService.incrementMembersCount(newGroup.id, qr);
      await this.groupsService.decrementMembersCount(groupHistory.groupId, qr);
    }

    // 새 그룹은 있지만 역할은 수정하지 않을 경우 기존 역할 삭제
    const deleteRole = !!(newGroup && !dto.groupRoleId);

    const groupRole = dto.groupRoleId
      ? dto.groupId
        ? await this.groupsRolesService.getGroupRoleById(
            // 그룹과 역할을 모두 바꾸는 경우
            churchId,
            dto.groupId,
            dto.groupRoleId,
            qr,
          )
        : await this.groupsRolesService.getGroupRoleById(
            // 역할만 바꾸는 경우
            churchId,
            groupHistory.groupId,
            dto.groupRoleId,
            qr,
          )
      : undefined;

    this.validateDate(dto, groupHistory);

    // 현재 그룹을 종료하는 경우
    if (dto.endDate) {
      await this.groupsService.decrementMembersCount(groupHistory.groupId, qr);
    }

    const result = await groupHistoryRepository.update(
      {
        id: groupHistoryId,
      },
      {
        group: newGroup,
        groupName: newGroup && newGroup.name,
        groupRoleId: deleteRole ? null : groupRole && groupRole.id,
        groupRoleName: deleteRole ? null : groupRole && groupRole.role,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 그룹 이력이 존재하지 않습니다.');
    }

    return groupHistoryRepository.findOne({ where: { id: groupHistory.id } });
  }

  private validateDate(
    dto: CreateGroupHistoryDto | UpdateGroupHistoryDto,
    groupHistory?: GroupHistoryModel,
  ) {
    // 종료일만 업데이트
    if (!dto.startDate && dto.endDate) {
      if (groupHistory && groupHistory.startDate > dto.endDate) {
        throw new BadRequestException(
          '그룹 종료일이 시작일보다 앞설 수 없습니다.',
        );
      }
    }

    // 시작일만 업데이트
    if (dto.startDate && !dto.endDate) {
      if (
        groupHistory &&
        groupHistory.endDate &&
        dto.startDate > groupHistory.endDate
      ) {
        throw new BadRequestException(
          '그룹 종료일이 시작일보다 앞설 수 없습니다.',
        );
      }
    }

    // 시작일, 종료일 업데이트
    if (dto.startDate && dto.endDate) {
      if (dto.startDate > dto.endDate) {
        throw new BadRequestException(
          '그룹 종료일이 시작일보다 앞설 수 없습니다.',
        );
      }
    }
  }

  async deleteGroupHistory(
    memberId: number,
    groupHistoryId: number,
    qr: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const groupHistory = await groupHistoryRepository.findOne({
      where: {
        id: groupHistoryId,
        memberId: memberId,
      },
    });

    if (!groupHistory) {
      throw new NotFoundException('해당 그룹 이력이 존재하지 않습니다.');
    }

    await groupHistoryRepository.softDelete({
      id: groupHistoryId,
      deletedAt: IsNull(),
    });

    await this.groupsService.decrementMembersCount(groupHistory.groupId, qr);

    return 'ok';
  }
}
