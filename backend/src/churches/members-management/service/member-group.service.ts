import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupHistoryModel } from '../entity/group-history.entity';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { MembersService } from '../../members/service/members.service';
import { GetGroupHistoryDto } from '../dto/group/get-group-history.dto';
import { AddMemberToGroupDto } from '../dto/group/add-member-to-group.dto';
import { UpdateGroupHistoryDto } from '../dto/group/update-group-history.dto';
import { EndMemberGroupDto } from '../dto/group/end-member-group.dto';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../../management/groups/groups-domain/interface/groups-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches-domain/interface/churches-domain.service.interface';

@Injectable()
export class MemberGroupService {
  constructor(
    @InjectRepository(GroupHistoryModel)
    private readonly groupHistoryRepository: Repository<GroupHistoryModel>,
    private readonly membersService: MembersService,
    //private readonly groupsService: GroupsService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupDomainService: IGroupsDomainService,
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

    const [groupHistories, totalCount] = await Promise.all([
      groupHistoryRepository.find({
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
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      groupHistoryRepository.count({
        where: {
          member: {
            churchId,
          },
          memberId,
        },
      }),
    ]);

    /*const groupHistories = await groupHistoryRepository.find({
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
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });*/

    // 현재 속한 그룹 이력
    const currentHistory = groupHistories.find((history) => !history.endDate);
    // 현재 그룹 snapShot 처리
    if (currentHistory) {
      const snapShot = await this.createCurrentGroupSnapShot(
        churchId,
        currentHistory,
        qr,
      );

      currentHistory.groupSnapShot = snapShot.groupSnapShot;
      currentHistory.groupRoleSnapShot = snapShot.groupRoleSnapShot;
    }

    const result = groupHistories.map((history) =>
      history.endDate === null
        ? { ...history, group: null, groupRole: null }
        : history,
    );

    return {
      data: result,
      totalCount,
      count: result.length,
      page: dto.page,
    };
  }

  // 현재 그룹의 스냅샷 생성
  private async createCurrentGroupSnapShot(
    churchId: number,
    groupHistory: GroupHistoryModel,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const parentGroups = groupHistory.groupId
      ? /*await this.groupsService.getParentGroups(
          churchId,
          groupHistory.groupId,
          qr,
        )*/
        await this.groupDomainService.findParentGroups(
          church,
          groupHistory.group,
          qr,
        )
      : [];

    const groupSnapShot = parentGroups
      .map((parentGroup) => parentGroup.name)
      .concat(groupHistory.group?.name)
      .join('__');

    return {
      groupSnapShot,
      groupRoleSnapShot: groupHistory.groupRole?.role || null,
    };
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
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

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

    // 그룹 검증
    const group = await this.groupDomainService.findGroupModelById(
      church,
      dto.groupId,
      qr,
      { groupRoles: true },
    );

    // 그룹 역할 검증
    const groupRole = dto.groupRoleId
      ? group.groupRoles.filter(
          (groupRole) => groupRole.id === dto.groupRoleId,
        )[0]
      : undefined;

    if (dto.groupRoleId && !groupRole) {
      throw new NotFoundException('해당 그룹에 존재하지 않는 역할입니다.');
    }

    await Promise.all([
      // 이력 생성
      groupHistoryRepository.save({
        member,
        group,
        groupRole,
        startDate: dto.startDate,
      }),

      // 그룹의 인원 수 증가
      this.groupDomainService.incrementMembersCount(group, qr),

      // 교인의 그룹 정보 업데이트
      this.membersService.startMemberGroup(member, group, groupRole, qr),
    ]);

    return this.membersService.getMemberById(churchId, memberId, qr);
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
        member: { group: true },
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

    const snapShot = await this.createCurrentGroupSnapShot(
      churchId,
      groupHistory,
      qr,
    );

    await Promise.all([
      // 그룹 이력 종료 날짜 추가, 스냅샷 추가
      groupHistoryRepository.update(
        {
          id: groupHistory.id,
        },
        {
          groupId: null,
          groupRoleId: null,
          groupRoleSnapShot: snapShot.groupRoleSnapShot,
          groupSnapShot: snapShot.groupSnapShot,
          endDate: dto.endDate,
        },
      ),
      // MemberModel, GroupModel, GroupRoleModel relation 해제
      this.membersService.endMemberGroup(groupHistory.member, qr),
      // 그룹 인원수 감소
      this.groupDomainService.decrementMembersCount(groupHistory.group, qr),
      /*this.groupService.decrementMembersCount(
        churchId,
        groupHistory.group.id,
        qr,
      ),*/
    ]);

    return this.membersService.getMemberById(churchId, memberId, qr);
  }

  private isValidUpdateDate(
    targetHistory: GroupHistoryModel,
    dto: UpdateGroupHistoryDto,
  ) {
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

    this.isValidUpdateDate(targetHistory, dto);

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
