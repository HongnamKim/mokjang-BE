import { Inject, Injectable } from '@nestjs/common';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { WidgetRangeEnum } from '../const/widget-range.enum';
import {
  add,
  endOfDay,
  endOfMonth,
  endOfWeek,
  getWeekOfMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { GetNewMemberSummaryDto } from '../dto/request/get-new-member-summary.dto';
import { GetNewMemberSummaryResponseDto } from '../dto/response/get-new-member-summary-response.dto';
import { GetNewMemberDetailDto } from '../dto/request/get-new-member-detail.dto';
import { GetNewMemberDetailResponseDto } from '../dto/response/get-new-member-detail-response.dto';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import {
  ITASK_DOMAIN_SERVICE,
  ITaskDomainService,
} from '../../task/task-domain/interface/task-domain.service.interface';
import { GetMyTasksDto } from '../dto/request/get-my-tasks.dto';
import { GetMyInChargedVisitationsDto } from '../dto/request/get-my-in-charged-visitations.dto';
import {
  IVISITATION_META_DOMAIN_SERVICE,
  IVisitationMetaDomainService,
} from '../../visitation/visitation-domain/interface/visitation-meta-domain.service.interface';
import { GetMySchedulesResponseDto } from '../dto/response/get-my-schedules-response.dto';
import { ScheduleDto } from '../dto/response/schedule.dto';
import { ScheduleType } from '../const/schedule-type.enum';

@Injectable()
export class HomeService {
  constructor(
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(ITASK_DOMAIN_SERVICE)
    private readonly taskDomainService: ITaskDomainService,
    @Inject(IVISITATION_META_DOMAIN_SERVICE)
    private readonly visitationMetaDomainService: IVisitationMetaDomainService,
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
      dto.range === WidgetRangeEnum.WEEKLY ? 'week' : 'month',
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

  private getScheduleRange(range: WidgetRangeEnum) {
    if (range === 'weekly') {
      const now = new Date();
      const start = fromZonedTime(
        startOfWeek(startOfDay(now)),
        TIME_ZONE.SEOUL,
      );
      const end = fromZonedTime(endOfWeek(endOfDay(now)), TIME_ZONE.SEOUL);

      return {
        from: start,
        to: end,
      };
    }

    const now = new Date();
    const start = fromZonedTime(startOfMonth(startOfDay(now)), TIME_ZONE.SEOUL);
    const end = fromZonedTime(endOfMonth(endOfDay(now)), TIME_ZONE.SEOUL);

    return {
      from: start,
      to: end,
    };
  }

  async getMyInChargedTasks(pm: ChurchUserModel, dto: GetMyTasksDto) {
    const me = pm.member;

    const defaultRange = this.getScheduleRange(dto.range);

    const [from, to] =
      dto.from && dto.to
        ? [
            fromZonedTime(startOfDay(dto.from), TIME_ZONE.SEOUL),
            fromZonedTime(endOfDay(dto.to), TIME_ZONE.SEOUL),
          ]
        : [defaultRange.from, defaultRange.to];

    const tasks = await this.taskDomainService.findMyTasks(me, dto, from, to);

    const scheduleTasks = tasks.map(
      (task) =>
        new ScheduleDto(
          task.id,
          ScheduleType.TASK,
          task.title,
          task.startDate,
          task.endDate,
          task.status,
        ),
    );

    return new GetMySchedulesResponseDto<ScheduleDto>(
      dto.range,
      from,
      to,
      scheduleTasks,
    );
  }

  async getMyInChargedVisitations(
    pm: ChurchUserModel,
    dto: GetMyInChargedVisitationsDto,
  ) {
    const me = pm.member;
    const defaultRange = this.getScheduleRange(dto.range);

    const [from, to] =
      dto.from && dto.to
        ? [
            fromZonedTime(startOfDay(dto.from), TIME_ZONE.SEOUL),
            fromZonedTime(endOfDay(dto.to), TIME_ZONE.SEOUL),
          ]
        : [defaultRange.from, defaultRange.to];

    const visitations =
      await this.visitationMetaDomainService.findMyVisitations(
        me,
        dto,
        from,
        to,
      );

    const scheduleVisitations = visitations.map(
      (visitation) =>
        new ScheduleDto(
          visitation.id,
          ScheduleType.VISITATION,
          visitation.title,
          visitation.startDate,
          visitation.endDate,
          visitation.status,
        ),
    );

    return new GetMySchedulesResponseDto<ScheduleDto>(
      dto.range,
      from,
      to,
      scheduleVisitations,
    );
  }
}
