import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetMinistryHistoriesDto } from '../dto/request/ministry/get-ministry-histories.dto';
import { UpdateMinistryHistoryDto } from '../dto/request/ministry/update-ministry-history.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import {
  IMINISTRY_HISTORY_DOMAIN_SERVICE,
  IMinistryHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-history-domain.service.interface';
import { MinistryHistoryPaginationResponseDto } from '../dto/response/ministry/ministry-history-pagination-response.dto';
import {
  IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-group-history-domain.service.interface';
import { convertHistoryDate } from '../../history-date.utils';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { PatchMinistryHistoryResponseDto } from '../dto/response/ministry/patch-ministry-history-response.dto';
import { DeleteMinistryHistoryResponseDto } from '../dto/response/ministry/delete-ministry-history-response.dto';

@Injectable()
export class MinistryHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupHistoryDomainService: IMinistryGroupHistoryDomainService,
    @Inject(IMINISTRY_HISTORY_DOMAIN_SERVICE)
    private readonly ministryHistoryDomainService: IMinistryHistoryDomainService,
  ) {}

  async getMinistryHistories(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    dto: GetMinistryHistoriesDto,
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
    const ministryGroupHistory =
      await this.ministryGroupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
        qr,
      );

    const ministryHistories =
      await this.ministryHistoryDomainService.paginateMinistryHistory(
        member,
        ministryGroupHistory,
        dto,
        qr,
      );

    const data = ministryHistories.map((history) => {
      if (history.endDate) {
        return history;
      } else {
        if (history.ministry) {
          history.ministrySnapShot = history.ministry.name;
        }
        return history;
      }
    });

    return new MinistryHistoryPaginationResponseDto(data);
  }

  async updateMinistryHistory(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    ministryHistoryId: number,
    dto: UpdateMinistryHistoryDto,
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

    const ministryGroupHistory =
      await this.ministryGroupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
        qr,
      );

    const targetHistory =
      await this.ministryHistoryDomainService.findMinistryHistoryModelById(
        member,
        ministryGroupHistory,
        ministryHistoryId,
        qr,
      );

    const historyDateUpdateValue = convertHistoryDate(
      dto.startDate,
      dto.endDate,
      TIME_ZONE.SEOUL,
    );

    // 업데이트
    await this.ministryHistoryDomainService.updateMinistryHistory(
      targetHistory,
      historyDateUpdateValue,
      qr,
    );

    const updatedHistory =
      await this.ministryHistoryDomainService.findMinistryHistoryModelById(
        member,
        ministryGroupHistory,
        ministryHistoryId,
        qr,
        {
          ministry: {
            ministryGroup: true,
          },
        },
      );

    if (updatedHistory.endDate) {
      return updatedHistory;
    } else {
      if (updatedHistory.ministry) {
        updatedHistory.ministrySnapShot = updatedHistory.ministry.name;
        updatedHistory.ministry = null;
      }

      return new PatchMinistryHistoryResponseDto(updatedHistory);
    }
  }

  async deleteMinistryHistory(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    ministryHistoryId: number,
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

    const ministryGroupHistory =
      await this.ministryGroupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
        qr,
      );

    const targetHistory =
      await this.ministryHistoryDomainService.findMinistryHistoryModelById(
        member,
        ministryGroupHistory,
        ministryHistoryId,
        qr,
      );

    await this.ministryHistoryDomainService.deleteMinistryHistory(
      targetHistory,
      qr,
    );

    return new DeleteMinistryHistoryResponseDto(
      new Date(),
      targetHistory.id,
      true,
    );
  }
}
