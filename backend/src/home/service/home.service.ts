import { Inject, Injectable } from '@nestjs/common';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { GetNewMemberSummaryRangeEnum } from '../const/get-new-member-summary-range.enum';
import {
  add,
  endOfDay,
  getWeekOfMonth,
  startOfDay,
  subMonths,
  subWeeks,
} from 'date-fns';
import { GetNewMemberSummaryDto } from '../dto/request/get-new-member-summary.dto';
import { GetNewMemberSummaryResponseDto } from '../dto/response/get-new-member-summary-response.dto';
import { GetNewMemberDetailDto } from '../dto/request/get-new-member-detail.dto';
import { GetNewMemberDetailResponseDto } from '../dto/response/get-new-member-detail-response.dto';

@Injectable()
export class HomeService {
  constructor(
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
  ) {}

  private getDateRange(range: 'weekly' | 'monthly') {
    const timeZone = TIME_ZONE.SEOUL;
    const now = new Date();

    if (range === 'weekly') {
      const start = subWeeks(startOfDay(now), 4);
      const end = endOfDay(now);

      return {
        from: fromZonedTime(start, timeZone),
        to: fromZonedTime(end, timeZone),
      };
    }

    // MONTHLY
    const start = subMonths(startOfDay(now), 12);
    const end = endOfDay(now);

    return {
      from: fromZonedTime(start, timeZone),
      to: toZonedTime(end, timeZone),
    };
  }

  async getNewMemberSummary(church: ChurchModel, dto: GetNewMemberSummaryDto) {
    const defaultRange = this.getDateRange(dto.range);

    const from = dto.from
      ? fromZonedTime(dto.from, TIME_ZONE.SEOUL)
      : defaultRange.from;
    const to = dto.to
      ? fromZonedTime(endOfDay(new Date(dto.to)), TIME_ZONE.SEOUL)
      : defaultRange.to;

    const data = await this.membersDomainService.getNewMemberSummary(
      church,
      dto.range,
      from,
      to,
    );

    const result = data.map((summary) => ({
      weekOfMonth: getWeekOfMonth(summary.period_start, { weekStartsOn: 0 }),
      periodStart: fromZonedTime(summary.period_start, TIME_ZONE.SEOUL),
      count: summary.count,
    }));

    return new GetNewMemberSummaryResponseDto(
      dto.range,
      dto.range === GetNewMemberSummaryRangeEnum.WEEKLY ? 'week' : 'month',
      result,
    );
  }

  async getNewMemberDetails(church: ChurchModel, dto: GetNewMemberDetailDto) {
    const from = fromZonedTime(dto.periodStart, TIME_ZONE.SEOUL);
    const to =
      dto.range === 'weekly'
        ? fromZonedTime(endOfDay(add(from, { weeks: 1 })), TIME_ZONE.SEOUL)
        : fromZonedTime(endOfDay(add(from, { months: 1 })), TIME_ZONE.SEOUL);

    const newMembers = await this.membersDomainService.findNewMemberDetails(
      church,
      dto,
      from,
      to,
    );

    return new GetNewMemberDetailResponseDto(newMembers);
  }
}
