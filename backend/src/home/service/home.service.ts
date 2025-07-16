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
import {
  IVISITATION_META_DOMAIN_SERVICE,
  IVisitationMetaDomainService,
} from '../../visitation/visitation-domain/interface/visitation-meta-domain.service.interface';
import { ScheduleDto } from '../dto/schedule.dto';
import { ScheduleType } from '../const/schedule-type.enum';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from '../../management/educations/service/education-domain/interface/education-session-domain.service.interface';
import { GetMyInChargedSchedulesDto } from '../dto/request/get-my-in-charged-schedules.dto';
import { GetMyReportsDto } from '../dto/request/get-my-reports.dto';
import {
  ITASK_REPORT_DOMAIN_SERVICE,
  ITaskReportDomainService,
} from '../../report/report-domain/interface/task-report-domain.service.interface';
import {
  IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE,
  IEducationSessionReportDomainService,
} from '../../report/report-domain/interface/education-session-report-domain.service.interface';
import {
  IVISITATION_REPORT_DOMAIN_SERVICE,
  IVisitationReportDomainService,
} from '../../report/report-domain/interface/visitation-report-domain.service.interface';
import { ScheduleReportDto } from '../dto/schedule-report.dto';
import { TaskModel } from '../../task/entity/task.entity';
import { EducationSessionModel } from '../../management/educations/entity/education-session.entity';
import { VisitationMetaModel } from '../../visitation/entity/visitation-meta.entity';
import { GetMyScheduleReportsResponseDto } from '../dto/response/get-my-schedule-reports-response.dto';

@Injectable()
export class HomeService {
  constructor(
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(ITASK_DOMAIN_SERVICE)
    private readonly taskDomainService: ITaskDomainService,
    @Inject(IVISITATION_META_DOMAIN_SERVICE)
    private readonly visitationMetaDomainService: IVisitationMetaDomainService,
    @Inject(IEDUCATION_SESSION_DOMAIN_SERVICE)
    private readonly educationSessionDomainService: IEducationSessionDomainService,

    @Inject(ITASK_REPORT_DOMAIN_SERVICE)
    private readonly taskReportDomainService: ITaskReportDomainService,
    @Inject(IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE)
    private readonly educationSessionReportDomainService: IEducationSessionReportDomainService,
    @Inject(IVISITATION_REPORT_DOMAIN_SERVICE)
    private readonly visitationReportDomainService: IVisitationReportDomainService,
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
    const start = subMonths(startOfDay(now), 6);
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

  private createTaskSchedule(task: TaskModel) {
    return new ScheduleDto(
      task.id,
      ScheduleType.TASK,
      task.title,
      task.startDate,
      task.endDate,
      task.status,
    );
  }

  private createVisitationSchedule(visitation: VisitationMetaModel) {
    return new ScheduleDto(
      visitation.id,
      ScheduleType.VISITATION,
      visitation.title,
      visitation.startDate,
      visitation.endDate,
      visitation.status,
    );
  }

  private createEducationSchedule(educationSession: EducationSessionModel) {
    return new ScheduleDto(
      educationSession.id,
      ScheduleType.EDUCATION,
      educationSession.title,
      educationSession.startDate,
      educationSession.endDate,
      educationSession.status,
      educationSession.educationTerm.id,
      educationSession.educationTerm.educationId,
    );
  }

  async getMyInChargedSchedules(
    pm: ChurchUserModel,
    dto: GetMyInChargedSchedulesDto,
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

    const tasks = await this.taskDomainService.findMyTasks(me, from, to);
    const scheduleTasks = tasks.map((task) => this.createTaskSchedule(task));

    const visitations =
      await this.visitationMetaDomainService.findMyVisitations(me, from, to);
    const scheduleVisitations = visitations.map((visitation) =>
      this.createVisitationSchedule(visitation),
    );

    const educations =
      await this.educationSessionDomainService.findMyEducationSessions(
        me,
        from,
        to,
      );
    const scheduleEducations = educations.map((educationSession) =>
      this.createEducationSchedule(educationSession),
    );

    const schedules = [
      ...scheduleTasks,
      ...scheduleEducations,
      ...scheduleVisitations,
    ];

    schedules.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());

    return schedules;
  }

  async getMyScheduleReports(pm: ChurchUserModel, dto: GetMyReportsDto) {
    const receiver = pm.member;

    const defaultRange = this.getScheduleRange(dto.range);

    const [from, to] =
      dto.from && dto.to
        ? [
            fromZonedTime(startOfDay(dto.from), TIME_ZONE.SEOUL),
            fromZonedTime(endOfDay(dto.to), TIME_ZONE.SEOUL),
          ]
        : [defaultRange.from, defaultRange.to];

    const taskReports = await this.taskReportDomainService.findMyReports(
      receiver,
      from,
      to,
    );
    const taskScheduleReports = taskReports.map(
      (taskReport) =>
        new ScheduleReportDto(
          taskReport.id,
          ScheduleType.TASK,
          taskReport.task.inCharge,
          this.createTaskSchedule(taskReport.task),
        ),
    );

    const educationReports =
      await this.educationSessionReportDomainService.findMyReports(
        receiver,
        from,
        to,
      );
    const educationScheduleReports = educationReports.map(
      (educationReport) =>
        new ScheduleReportDto(
          educationReport.id,
          ScheduleType.EDUCATION,
          educationReport.educationSession.inCharge,
          this.createEducationSchedule(educationReport.educationSession),
        ),
    );

    const visitationReports =
      await this.visitationReportDomainService.findMyReports(
        receiver,
        from,
        to,
      );
    const visitationScheduleReports = visitationReports.map(
      (visitationReport) =>
        new ScheduleReportDto(
          visitationReport.id,
          ScheduleType.VISITATION,
          visitationReport.visitation.inCharge,
          this.createVisitationSchedule(visitationReport.visitation),
        ),
    );

    const scheduleReports = [
      ...taskScheduleReports,
      ...educationScheduleReports,
      ...visitationScheduleReports,
    ];

    scheduleReports.sort(
      (a, b) => a.schedule.endDate.getTime() - b.schedule.endDate.getTime(),
    );

    const data = scheduleReports.slice(
      (dto.page - 1) * 50,
      (dto.page - 1) * 50 + 50,
    );

    return new GetMyScheduleReportsResponseDto(data);
  }
}
