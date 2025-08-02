import { Inject, Injectable } from '@nestjs/common';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { WidgetRange } from '../const/widget-range.enum';
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
import { VisitationMetaModel } from '../../visitation/entity/visitation-meta.entity';
import { GetMyScheduleReportsResponseDto } from '../dto/response/get-my-schedule-reports-response.dto';
import { GetLowWorshipAttendanceMembersDto } from '../dto/request/get-low-worship-attendance-members.dto';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../../worship/worship-domain/interface/worship-domain.service.interface';
import {
  IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
  IWorshipEnrollmentDomainService,
} from '../../worship/worship-domain/interface/worship-enrollment-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { WorshipModel } from '../../worship/entity/worship.entity';
import { GetLowWorshipAttendanceMembersResponseDto } from '../dto/response/get-low-worship-attendance-members-response.dto';
import { AttendanceRange } from '../const/attendance-range.enum';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from '../../educations/education-domain/interface/education-session-domain.service.interface';
import { EducationSessionModel } from '../../educations/education-session/entity/education-session.entity';

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

    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IWORSHIP_ENROLLMENT_DOMAIN_SERVICE)
    private readonly worshipEnrollmentDomainService: IWorshipEnrollmentDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  private getDateRange(range: 'weekly' | 'monthly') {
    const now = new Date();

    if (range === 'weekly') {
      const start = subWeeks(startOfDay(now), 4);
      const end = endOfDay(now);

      return {
        from: fromZonedTime(start, TIME_ZONE.SEOUL),
        to: fromZonedTime(end, TIME_ZONE.SEOUL),
      };
    }

    // MONTHLY
    const start = subMonths(startOfDay(now), 6);
    const end = endOfDay(now);

    return {
      from: fromZonedTime(start, TIME_ZONE.SEOUL),
      to: fromZonedTime(end, TIME_ZONE.SEOUL),
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
      dto.range === WidgetRange.WEEKLY ? 'week' : 'month',
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

  private getScheduleRange(range: WidgetRange) {
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

  async getLowWorshipAttendanceMembers(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    dto: GetLowWorshipAttendanceMembersDto,
  ) {
    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      dto.worshipId,
      undefined,
      { worshipTargetGroups: { group: true } },
    );

    const groupRange = await this.getGroupRange(
      church,
      worship,
      requestManager,
    );

    const { from, to } = this.getAttendanceDateRange(dto.range);

    const data =
      await this.worshipEnrollmentDomainService.findLowAttendanceEnrollments(
        worship,
        from,
        to,
        dto,
        groupRange,
      );

    return new GetLowWorshipAttendanceMembersResponseDto(data);
  }

  private getAttendanceDateRange(range: AttendanceRange) {
    const now = new Date();

    let subMonthsAmount: number;
    switch (range) {
      case AttendanceRange.MONTHLY:
        subMonthsAmount = 1;
        break;
      case AttendanceRange.QUARTER:
        subMonthsAmount = 3;
        break;
      case AttendanceRange.HALF:
        subMonthsAmount = 6;
        break;
    }

    const start = subMonths(startOfDay(now), subMonthsAmount);
    const end = endOfDay(now);

    return {
      from: fromZonedTime(start, TIME_ZONE.SEOUL),
      to: fromZonedTime(end, TIME_ZONE.SEOUL),
    };
  }

  private async getGroupRange(
    church: ChurchModel,
    worship: WorshipModel,
    requestManager: ChurchUserModel,
  ) {
    const worshipTargetGroupIds = worship.worshipTargetGroups.map(
      (targetGroup) => targetGroup.groupId,
    );

    const allWorshipTargetGroupIds = (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        worshipTargetGroupIds,
      )
    ).map((group) => group.id);

    const isAllGroupPermission = requestManager.permissionScopes.some(
      (permissionScope) => permissionScope.isAllGroups,
    );

    if (isAllGroupPermission) {
      return allWorshipTargetGroupIds;
    }

    const permissionScopeIds = requestManager.permissionScopes.map(
      (permissionScope) => permissionScope.group.id,
    );

    const allPermissionGroupIds = (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        permissionScopeIds,
      )
    ).map((group) => group.id);

    return this.getIntersections(
      allWorshipTargetGroupIds,
      allPermissionGroupIds,
    );
  }

  private getIntersections(
    allWorshipTargetGroupIds: number[],
    allPermissionGroupIds: number[],
  ) {
    // 예배 대상이 전체인 경우
    if (allWorshipTargetGroupIds.length === 0) {
      return allPermissionGroupIds;
    }

    const allPermissionGroupIdSet = new Set(allPermissionGroupIds);

    return allWorshipTargetGroupIds.filter((targetGroupId) =>
      allPermissionGroupIdSet.has(targetGroupId),
    );
  }
}
