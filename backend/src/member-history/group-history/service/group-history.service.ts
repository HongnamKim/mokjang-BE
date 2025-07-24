import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GroupHistoryModel } from '../entity/group-history.entity';
import { QueryRunner } from 'typeorm';
import { GetGroupHistoryDto } from '../dto/get-group-history.dto';
import { UpdateGroupHistoryDto } from '../dto/update-group-history.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../../management/groups/groups-domain/interface/groups-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import {
  IGROUP_HISTORY_DOMAIN_SERVICE,
  IGroupHistoryDomainService,
} from '../group-history-domain/interface/group-history-domain.service.interface';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GroupHistoryException } from '../exception/group-history.exception';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { convertHistoryDate } from '../../history-date.utils';
import { PatchGroupHistoryResponseDto } from '../dto/response/patch-group-history-response.dto';
import { DeleteGroupHistoryResponseDto } from '../dto/response/delete-group-history-response.dto';

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

    const targetHistory =
      await this.groupHistoryDomainService.findGroupHistoryModelById(
        member,
        groupHistoryId,
        qr,
        { group: true },
      );

    const historyDateUpdateValue = convertHistoryDate(
      dto.startDate,
      dto.endDate,
      TIME_ZONE.SEOUL,
    );

    await this.groupHistoryDomainService.updateGroupHistory(
      targetHistory,
      historyDateUpdateValue,
      qr,
    );

    if (historyDateUpdateValue.startDate) {
      targetHistory.startDate = historyDateUpdateValue.startDate;
    }
    if (historyDateUpdateValue.endDate) {
      targetHistory.endDate = historyDateUpdateValue.endDate;
    }

    if (!targetHistory.endDate) {
      targetHistory.groupSnapShot = targetHistory.group
        ? await this.groupDomainService.getGroupNameWithHierarchy(
            church,
            targetHistory.group,
            qr,
          )
        : '알 수 없는 그룹';
      targetHistory.group = null;
    }

    return new PatchGroupHistoryResponseDto(targetHistory);
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

    return new DeleteGroupHistoryResponseDto(
      new Date(),
      targetHistory.id,
      true,
    );
  }
}
