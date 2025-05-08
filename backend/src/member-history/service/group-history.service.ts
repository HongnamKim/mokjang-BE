import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GroupHistoryModel } from '../entity/group-history.entity';
import { QueryRunner } from 'typeorm';
import { GetGroupHistoryDto } from '../dto/group/get-group-history.dto';
import { AddMemberToGroupDto } from '../dto/group/add-member-to-group.dto';
import { UpdateGroupHistoryDto } from '../dto/group/update-group-history.dto';
import { EndMemberGroupDto } from '../dto/group/end-member-group.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import {
  IGROUP_HISTORY_DOMAIN_SERVICE,
  IGroupHistoryDomainService,
} from '../member-history-domain/interface/group-history-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import {
  IGROUP_ROLES_DOMAIN_SERVICE,
  IGroupRolesDomainService,
} from '../../management/groups/groups-domain/interface/groups-roles-domain.service.interface';
import { GroupHistoryException } from '../const/exception/group-history.exception';

@Injectable()
export class GroupHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupDomainService: IGroupsDomainService,
    @Inject(IGROUP_ROLES_DOMAIN_SERVICE)
    private readonly groupRolesDomainService: IGroupRolesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IGROUP_HISTORY_DOMAIN_SERVICE)
    private readonly groupHistoryDomainService: IGroupHistoryDomainService,
  ) {}

  async getMemberGroupHistory(
    churchId: number,
    memberId: number,
    dto: GetGroupHistoryDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    const { groupHistories, totalCount } =
      await this.groupHistoryDomainService.paginateGroupHistory(
        member,
        dto,
        qr,
      );

    // 현재 속한 그룹 이력
    const currentGroup = groupHistories.find((history) => !history.endDate);
    // 현재 그룹 snapShot 처리
    if (currentGroup) {
      const snapShot = await this.createCurrentGroupSnapShot(
        church,
        currentGroup,
        qr,
      );

      currentGroup.groupSnapShot = snapShot.groupSnapShot;
      currentGroup.groupRoleSnapShot = snapShot.groupRoleSnapShot;
    }

    const data = groupHistories.map((history) =>
      history.endDate === null
        ? { ...history, group: null, groupRole: null }
        : history,
    );

    return {
      data,
      totalCount,
      count: data.length,
      page: dto.page,
      totalPage: Math.ceil(totalCount / dto.take),
    };
  }

  // 현재 그룹의 스냅샷 생성
  private async createCurrentGroupSnapShot(
    church: ChurchModel,
    groupHistory: GroupHistoryModel,
    qr?: QueryRunner,
  ) {
    if (!groupHistory.group) {
      throw new InternalServerErrorException(
        GroupHistoryException.RELATION_OPTIONS_ERROR,
      );
    }

    const parentGroups = await this.groupDomainService.findParentGroups(
      church,
      groupHistory.group,
      qr,
    );

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

    // 교인 검증
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    // 그룹 검증
    const group = await this.groupDomainService.findGroupModelById(
      church,
      dto.groupId,
      qr,
    );

    // 그룹 역할 검증
    const groupRole = dto.groupRoleId
      ? await this.groupRolesDomainService.findGroupRoleById(
          //churchId,
          //dto.groupId,
          group,
          dto.groupRoleId,
          qr,
        )
      : undefined;

    const [newGroupHistory] = await Promise.all([
      // 이력 생성
      this.groupHistoryDomainService.createGroupHistory(
        member,
        group,
        groupRole,
        dto.startDate,
        qr,
      ),

      // 그룹의 인원 수 증가
      this.groupDomainService.incrementMembersCount(group, qr),

      // 교인의 그룹 정보 업데이트
      this.membersDomainService.startMemberGroup(member, group, groupRole, qr),
    ]);

    const snapShot = await this.createCurrentGroupSnapShot(
      church,
      newGroupHistory,
      qr,
    );
    newGroupHistory.groupRoleSnapShot = snapShot.groupRoleSnapShot;
    newGroupHistory.groupSnapShot = snapShot.groupSnapShot;

    return {
      ...newGroupHistory,
      groupRole: null,
      group: null,
    };
  }

  async endMemberGroup(
    churchId: number,
    memberId: number,
    dto: EndMemberGroupDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
      {
        group: true,
        groupRole: true,
      },
    );

    const groupHistory =
      await this.groupHistoryDomainService.findCurrentGroupHistoryModel(
        member,
        qr,
        { group: true },
      );

    const snapShot = await this.createCurrentGroupSnapShot(
      church,
      groupHistory,
      qr,
    );

    await Promise.all([
      // 그룹 이력 종료 날짜 추가, 스냅샷 추가
      this.groupHistoryDomainService.endGroupHistory(
        groupHistory,
        snapShot,
        dto.endDate,
        qr,
      ),
      // MemberModel, GroupModel, GroupRoleModel relation 해제
      this.membersDomainService.endMemberGroup(member, qr),
      // 그룹 인원수 감소
      this.groupDomainService.decrementMembersCount(groupHistory.group, qr),
    ]);

    return this.groupHistoryDomainService.findGroupHistoryModelById(
      member,
      groupHistory.id,
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
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    const groupHistory =
      await this.groupHistoryDomainService.findGroupHistoryModelById(
        member,
        groupHistoryId,
        qr,
      );

    await this.groupHistoryDomainService.updateGroupHistory(
      groupHistory,
      dto,
      qr,
    );

    const updatedHistory =
      await this.groupHistoryDomainService.findGroupHistoryModelById(
        member,
        groupHistoryId,
        qr,
        { group: true, groupRole: true },
      );

    if (updatedHistory.group) {
      const snapShot = await this.createCurrentGroupSnapShot(
        church,
        updatedHistory,
        qr,
      );

      return {
        ...updatedHistory,
        groupSnapShot: snapShot.groupSnapShot,
        groupRoleSnapShot: snapShot.groupRoleSnapShot,
        group: undefined,
        groupRole: undefined,
      };
    } else {
      return updatedHistory;
    }
  }

  async deleteGroupHistory(
    churchId: number,
    memberId: number,
    groupHistoryId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    const targetHistory =
      await this.groupHistoryDomainService.findGroupHistoryModelById(
        member,
        groupHistoryId,
        qr,
      );

    await this.groupHistoryDomainService.deleteGroupHistory(targetHistory, qr);

    return `groupHistoryId ${groupHistoryId} deleted`;
  }
}
