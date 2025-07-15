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
import { GroupHistoryException } from '../exception/group-history.exception';
import { startOfDay } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';

@Injectable()
export class GroupHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupDomainService: IGroupsDomainService,
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
      currentGroup.groupSnapShot = await this.createCurrentGroupSnapShot(
        church,
        currentGroup,
        qr,
      );
    }

    const data = groupHistories.map((history) =>
      history.endDate === null ? { ...history, group: null } : history,
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

    return parentGroups
      .map((parentGroup) => parentGroup.name)
      .concat(groupHistory.group?.name)
      .join('__');
  }

  // 등록하려는 그룹이 교회에 존재하는지
  // 교인이 교회에 존재하는지
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

    const startDate = fromZonedTime(startOfDay(dto.startDate), TIME_ZONE.SEOUL);

    const [newGroupHistory] = await Promise.all([
      // 이력 생성
      this.groupHistoryDomainService.createGroupHistory(
        member,
        group,
        startDate,
        qr,
      ),

      // 그룹의 인원 수 증가
      this.groupDomainService.incrementMembersCount(group, qr),

      // 교인의 그룹 정보 업데이트
      this.membersDomainService.startMemberGroup(member, group, qr),
    ]);

    newGroupHistory.groupSnapShot = await this.createCurrentGroupSnapShot(
      church,
      newGroupHistory,
      qr,
    );

    return {
      ...newGroupHistory,
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

    const endDate = fromZonedTime(startOfDay(dto.endDate), TIME_ZONE.SEOUL);

    await Promise.all([
      // 그룹 이력 종료 날짜 추가, 스냅샷 추가
      this.groupHistoryDomainService.endGroupHistory(
        groupHistory,
        snapShot,
        endDate,
        qr,
      ),

      // MemberModel, GroupModel relation 해제
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

    const startDate = dto.startDate
      ? fromZonedTime(startOfDay(dto.startDate), TIME_ZONE.SEOUL)
      : undefined;
    const endDate = dto.endDate
      ? fromZonedTime(startOfDay(dto.endDate), TIME_ZONE.SEOUL)
      : undefined;

    await this.groupHistoryDomainService.updateGroupHistory(
      groupHistory,
      startDate,
      endDate,
      qr,
    );

    const updatedHistory =
      await this.groupHistoryDomainService.findGroupHistoryModelById(
        member,
        groupHistoryId,
        qr,
        { group: true },
      );

    if (updatedHistory.group) {
      // 현재 진행중인 이력을 수정
      const groupSnapShot = await this.createCurrentGroupSnapShot(
        church,
        updatedHistory,
        qr,
      );

      return {
        ...updatedHistory,
        groupSnapShot: groupSnapShot,
        group: null,
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
