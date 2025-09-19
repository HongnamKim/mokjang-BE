import { Inject, Injectable } from '@nestjs/common';
import {
  IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-group-history-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import { GetMinistryGroupHistoriesDto } from '../dto/request/group/get-ministry-group-histories.dto';
import { MinistryGroupHistoryPaginationResponseDto } from '../dto/response/group/ministry-group-history-pagination-response.dto';
import { UpdateMinistryGroupHistoryDto } from '../dto/request/group/update-ministry-group-history.dto';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { convertHistoryDate } from '../../history-date.utils';
import { DeleteMinistryGroupHistoryResponseDto } from '../dto/response/group/delete-ministry-group-history-response.dto';
import { PatchMinistryGroupHistoryResponseDto } from '../dto/response/group/patch-ministry-group-history-response.dto';
import { GetMinistryGroupHistoryListDto } from '../dto/request/group/get-ministry-group-history-list.dto';
import { CurrentMinistryGroupHistoryPaginationResponseDto } from '../dto/response/group/current-ministry-group-history-pagination-response.dto';

@Injectable()
export class MinistryGroupHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupHistoryDomainService: IMinistryGroupHistoryDomainService,
  ) {}

  async getMinistryGroupHistories(
    churchId: number,
    memberId: number,
    dto: GetMinistryGroupHistoriesDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const histories =
      await this.ministryGroupHistoryDomainService.paginateMinistryGroupHistories(
        member,
        dto,
      );

    histories.forEach((history) => {
      if (!history.endDate) {
        history.ministryGroupSnapShot = history.ministryGroup
          ? history.ministryGroup.name
          : null;

        history.ministryGroup = null;
      }
    });

    return new MinistryGroupHistoryPaginationResponseDto(histories);
  }

  async patchMinistryGroupHistory(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    dto: UpdateMinistryGroupHistoryDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const targetHistory =
      await this.ministryGroupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
      );

    const historyDateUpdateValue = convertHistoryDate(
      dto.startDate,
      dto.endDate,
      TIME_ZONE.SEOUL,
    );

    await this.ministryGroupHistoryDomainService.updateMinistryGroupHistory(
      targetHistory,
      historyDateUpdateValue,
    );

    if (historyDateUpdateValue.startDate)
      targetHistory.startDate = historyDateUpdateValue.startDate;
    if (historyDateUpdateValue.endDate)
      targetHistory.endDate = historyDateUpdateValue.endDate;

    return new PatchMinistryGroupHistoryResponseDto(targetHistory);
  }

  async deleteMinistryGroupHistory(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const targetHistory =
      await this.ministryGroupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
      );

    await this.ministryGroupHistoryDomainService.deleteMinistryGroupHistory(
      targetHistory,
    );

    return new DeleteMinistryGroupHistoryResponseDto(
      new Date(),
      targetHistory.id,
      true,
    );
  }

  async getCurrentMinistryGroupHistories(
    churchId: number,
    memberId: number,
    query: GetMinistryGroupHistoryListDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const result =
      await this.ministryGroupHistoryDomainService.findCurrentMinistryGroupHistoryList(
        member,
        query,
      );

    return new CurrentMinistryGroupHistoryPaginationResponseDto(
      result.items,
      result.items.length,
      result.nextCursor,
      result.hasMore,
    );
  }
}
