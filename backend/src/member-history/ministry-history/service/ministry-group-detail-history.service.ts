import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import {
  IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-group-history-domain.service.interface';
import {
  IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupDetailHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-group-detail-history-domain.service.interface';
import { GetMinistryGroupDetailHistoriesDto } from '../dto/request/detail/get-ministry-group-detail-histories.dto';
import { MinistryGroupDetailHistoryPaginationResponseDto } from '../dto/response/detail/ministry-group-detail-history-pagination-response.dto';
import { UpdateMinistryGroupDetailHistoryDto } from '../dto/request/detail/update-ministry-group-detail-history.dto';
import {
  convertHistoryDate,
  HistoryUpdateDate,
} from '../../history-date.utils';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { MinistryGroupDetailHistoryException } from '../exception/ministry-group-detail-history.exception';
import { PatchMinistryGroupDetailHistoryResponseDto } from '../dto/response/detail/patch-ministry-group-detail-history-response.dto';
import { MinistryGroupHistoryModel } from '../entity/ministry-group-history.entity';
import { DeleteMinistryGroupDetailHistoryResponseDto } from '../dto/response/detail/delete-ministry-group-detail-history-response.dto';

@Injectable()
export class MinistryGroupDetailHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupHistoryDomainService: IMinistryGroupHistoryDomainService,
    @Inject(IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupDetailHistoryDomainService: IMinistryGroupDetailHistoryDomainService,
  ) {}

  async getDetailHistories(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    dto: GetMinistryGroupDetailHistoriesDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const groupHistory =
      await this.ministryGroupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
      );

    const data =
      await this.ministryGroupDetailHistoryDomainService.paginateDetailHistories(
        groupHistory,
        dto,
      );

    return new MinistryGroupDetailHistoryPaginationResponseDto(data);
  }

  async patchDetailHistory(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    detailHistoryId: number,
    dto: UpdateMinistryGroupDetailHistoryDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );
    const ministryGroupHistory =
      await this.ministryGroupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
      );

    const targetHistory =
      await this.ministryGroupDetailHistoryDomainService.findMinistryDetailHistoryModelById(
        member,
        ministryGroupHistory,
        detailHistoryId,
      );

    const historyDateUpdateValue = convertHistoryDate(
      dto.startDate,
      dto.endDate,
      TIME_ZONE.SEOUL,
    );

    this.validateUpdateDate(historyDateUpdateValue, ministryGroupHistory);

    await this.ministryGroupDetailHistoryDomainService.updateDetailHistory(
      targetHistory,
      historyDateUpdateValue,
    );

    if (historyDateUpdateValue.startDate) {
      targetHistory.startDate = historyDateUpdateValue.startDate;
    }
    if (historyDateUpdateValue.endDate) {
      targetHistory.endDate = historyDateUpdateValue.endDate;
    }

    return new PatchMinistryGroupDetailHistoryResponseDto(targetHistory);
  }

  async deleteDetailHistory(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    detailHistoryId: number,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );
    const ministryGroupHistory =
      await this.ministryGroupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
      );

    const targetHistory =
      await this.ministryGroupDetailHistoryDomainService.findMinistryDetailHistoryModelById(
        member,
        ministryGroupHistory,
        detailHistoryId,
      );

    await this.ministryGroupDetailHistoryDomainService.deleteDetailHistory(
      targetHistory,
    );

    return new DeleteMinistryGroupDetailHistoryResponseDto(
      new Date(),
      targetHistory.id,
      true,
    );
  }

  private validateUpdateDate(
    historyDateUpdateValue: HistoryUpdateDate,
    ministryGroupHistory: MinistryGroupHistoryModel,
  ) {
    // 상세 시작 날짜가 그룹 시작 날짜 이후인지
    if (historyDateUpdateValue.startDate) {
      if (historyDateUpdateValue.startDate < ministryGroupHistory.startDate) {
        throw new BadRequestException(
          MinistryGroupDetailHistoryException.INVALID_CHILD_START_DATE('start'),
        );
      }
    }

    // 상세 종료 날짜가 그룹 시작 날짜 이후인지
    if (historyDateUpdateValue.endDate) {
      if (historyDateUpdateValue.endDate < ministryGroupHistory.startDate) {
        throw new BadRequestException(
          MinistryGroupDetailHistoryException.INVALID_CHILD_END_DATE('start'),
        );
      }
    }

    if (historyDateUpdateValue.startDate && ministryGroupHistory.endDate) {
      if (historyDateUpdateValue.startDate > ministryGroupHistory.endDate) {
        throw new BadRequestException(
          MinistryGroupDetailHistoryException.INVALID_CHILD_START_DATE('end'),
        );
      }
    }

    // 상세 종료 날짜가 그룹 종료 이전인지
    if (historyDateUpdateValue.endDate && ministryGroupHistory.endDate) {
      if (historyDateUpdateValue.endDate > ministryGroupHistory.endDate) {
        throw new BadRequestException(
          MinistryGroupDetailHistoryException.INVALID_CHILD_END_DATE('end'),
        );
      }
    }
  }
}
