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
  IGROUP_HISTORY_DOMAIN_SERVICE,
  IGroupHistoryDomainService,
} from '../group-history-domain/interface/group-history-domain.service.interface';
import {
  IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
  IGroupDetailHistoryDomainService,
} from '../group-history-domain/interface/group-detail-history-domain.service.interface';
import { GetGroupHistoryDto } from '../dto/request/get-group-history.dto';
import { GetGroupDetailHistoriesResponseDto } from '../dto/response/detail/get-group-detail-histories-response.dto';
import { UpdateGroupHistoryDto } from '../dto/request/update-group-history.dto';
import { QueryRunner } from 'typeorm';
import {
  convertHistoryDate,
  HistoryUpdateDate,
} from '../../history-date.utils';
import { MinistryGroupDetailHistoryException } from '../../ministry-history/exception/ministry-group-detail-history.exception';
import { GroupHistoryModel } from '../entity/group-history.entity';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { PatchGroupDetailHistoryResponseDto } from '../dto/response/detail/patch-group-detail-history-response.dto';
import { DeleteGroupDetailHistoryResponseDto } from '../dto/response/detail/delete-group-detail-history-response.dto';

@Injectable()
export class GroupDetailHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IGROUP_HISTORY_DOMAIN_SERVICE)
    private readonly groupHistoryDomainService: IGroupHistoryDomainService,
    @Inject(IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE)
    private readonly groupDetailHistoryDomainService: IGroupDetailHistoryDomainService,
  ) {}

  async getDetailHistories(
    churchId: number,
    memberId: number,
    groupHistoryId: number,
    dto: GetGroupHistoryDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );
    const groupHistory =
      await this.groupHistoryDomainService.findGroupHistoryModelById(
        member,
        groupHistoryId,
      );

    const detailHistory =
      await this.groupDetailHistoryDomainService.paginateDetailHistories(
        groupHistory,
        dto,
      );

    return new GetGroupDetailHistoriesResponseDto(detailHistory);
  }

  async patchDetailHistory(
    churchId: number,
    memberId: number,
    groupHistoryId: number,
    detailHistoryId: number,
    dto: UpdateGroupHistoryDto,
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
    const groupHistory =
      await this.groupHistoryDomainService.findGroupHistoryModelById(
        member,
        groupHistoryId,
        qr,
      );

    const targetHistory =
      await this.groupDetailHistoryDomainService.findGroupDetailHistoryModelById(
        groupHistory,
        detailHistoryId,
        qr,
      );

    const historyDateUpdateValue = convertHistoryDate(
      dto.startDate,
      dto.endDate,
      TIME_ZONE.SEOUL,
    );

    this.validateUpdateDate(historyDateUpdateValue, groupHistory);

    await this.groupDetailHistoryDomainService.updateDetailHistory(
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

    return new PatchGroupDetailHistoryResponseDto(targetHistory);
  }

  async deleteDetailHistory(
    churchId: number,
    memberId: number,
    groupHistoryId: number,
    detailHistoryId: number,
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
    const groupHistory =
      await this.groupHistoryDomainService.findGroupHistoryModelById(
        member,
        groupHistoryId,
        qr,
      );

    const targetHistory =
      await this.groupDetailHistoryDomainService.findGroupDetailHistoryModelById(
        groupHistory,
        detailHistoryId,
        qr,
      );

    await this.groupDetailHistoryDomainService.deleteDetailHistory(
      targetHistory,
      qr,
    );

    return new DeleteGroupDetailHistoryResponseDto(
      new Date(),
      targetHistory.id,
      true,
    );
  }

  private validateUpdateDate(
    historyDateUpdateValue: HistoryUpdateDate,
    groupHistory: GroupHistoryModel,
  ) {
    // 상세 시작 날짜가 그룹 시작 날짜 이후인지
    if (historyDateUpdateValue.startDate) {
      if (historyDateUpdateValue.startDate < groupHistory.startDate) {
        throw new BadRequestException(
          MinistryGroupDetailHistoryException.INVALID_CHILD_START_DATE('start'),
        );
      }
    }

    // 상세 종료 날짜가 그룹 시작 날짜 이후인지
    if (historyDateUpdateValue.endDate) {
      if (historyDateUpdateValue.endDate < groupHistory.startDate) {
        throw new BadRequestException(
          MinistryGroupDetailHistoryException.INVALID_CHILD_END_DATE('start'),
        );
      }
    }

    if (historyDateUpdateValue.startDate && groupHistory.endDate) {
      if (historyDateUpdateValue.startDate > groupHistory.endDate) {
        throw new BadRequestException(
          MinistryGroupDetailHistoryException.INVALID_CHILD_START_DATE('end'),
        );
      }
    }

    // 상세 종료 날짜가 그룹 종료 이전인지
    if (historyDateUpdateValue.endDate && groupHistory.endDate) {
      if (historyDateUpdateValue.endDate > groupHistory.endDate) {
        throw new BadRequestException(
          MinistryGroupDetailHistoryException.INVALID_CHILD_END_DATE('end'),
        );
      }
    }
  }
}
