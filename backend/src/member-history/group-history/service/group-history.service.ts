import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetGroupHistoryDto } from '../dto/request/get-group-history.dto';
import { UpdateGroupHistoryDto } from '../dto/request/update-group-history.dto';
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
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { convertHistoryDate } from '../../history-date.utils';
import { PatchGroupHistoryResponseDto } from '../dto/response/patch-group-history-response.dto';
import { DeleteGroupHistoryResponseDto } from '../dto/response/delete-group-history-response.dto';
import { GetGroupHistoriesResponseDto } from '../dto/response/get-group-histories-response.dto';
import { GroupHistoryDto } from '../dto/group-history.dto';
import { GroupModel } from '../../../management/groups/entity/group.entity';

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

    const groupHistories =
      await this.groupHistoryDomainService.paginateGroupHistory(
        member,
        dto,
        qr,
      );

    // 현재 속한 그룹 이력
    const currentHistory = groupHistories.find((history) => !history.endDate);

    // 현재 그룹 snapShot 처리
    if (currentHistory) {
      currentHistory.groupSnapShot = currentHistory.group
        ? await this.groupDomainService.getGroupNameWithHierarchy(
            church,
            currentHistory.group as GroupModel,
          )
        : '알 수 없는 그룹';
    }

    const data = groupHistories.map((history) => new GroupHistoryDto(history));

    return new GetGroupHistoriesResponseDto(data);
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

    // 업데이트 날짜 적용
    if (historyDateUpdateValue.startDate) {
      targetHistory.startDate = historyDateUpdateValue.startDate;
    }
    if (historyDateUpdateValue.endDate) {
      targetHistory.endDate = historyDateUpdateValue.endDate;
    }

    // 그룹명 변환
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
