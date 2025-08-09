import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IReportDomainService } from '../interface/report-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportModel } from '../../base-report/entity/report.entity';
import { QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { TaskReportModel } from '../../task-report/entity/task-report.entity';
import { ScheduleDto } from '../../../home/dto/schedule.dto';
import { ScheduleReportDto } from '../../../home/dto/schedule-report.dto';
import { ScheduleType } from '../../../home/const/schedule-type.enum';
import { VisitationReportModel } from '../../visitation-report/entity/visitation-report.entity';
import { EducationSessionReportModel } from '../../education-report/entity/education-session-report.entity';
import { EducationTermReportModel } from '../../education-report/entity/education-term-report.entity';
import { ReportType } from '../../base-report/const/report-type.enum';

@Injectable()
export class ReportDomainService implements IReportDomainService {
  constructor(
    @InjectRepository(ReportModel)
    private readonly reportRepository: Repository<ReportModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ReportModel) : this.reportRepository;
  }

  async paginateReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const reportsQb = repository
      .createQueryBuilder('report')
      .select(['report.id', 'report.reportedAt', 'report.reportType'])
      .where('report.receiverId = :receiverId', { receiverId: receiver.id });

    this.createQuery(reportsQb, 'task');
    this.createQuery(reportsQb, 'visitation');
    this.createQuery(reportsQb, 'educationSession');
    this.createQuery(reportsQb, 'educationTerm');

    const startDateCoalesce =
      'COALESCE(task.startDate, visitation.startDate, educationSession.startDate, term.startDate)';
    const endDateCoalesce =
      'COALESCE(task.endDate, visitation.endDate, educationSession.endDate, term.endDate)';

    reportsQb
      .addSelect(startDateCoalesce, 'start_date')
      .addSelect(endDateCoalesce, 'end_date')
      .andWhere(`${startDateCoalesce} <= :to`, { to })
      .andWhere(`${endDateCoalesce} >= :from`, { from })
      .orderBy('end_date', 'ASC', 'NULLS LAST');

    const { entities, raw } = await reportsQb.getRawAndEntities();

    return entities;

    /*return entities.map((report, index) => {
      if (report instanceof TaskReportModel) {
        return new ScheduleReportDto(
          report.id,
          ScheduleType.TASK,
          report.task.inCharge,
          new ScheduleDto(
            report.task.id,
            ScheduleType.TASK,
            report.task.title,
            report.task.startDate,
            report.task.endDate,
            report.task.status,
          ),
        );
      } else if (report instanceof VisitationReportModel) {
        return new ScheduleReportDto(
          report.id,
          ScheduleType.VISITATION,
          report.visitation.inCharge,
          new ScheduleDto(
            report.visitation.id,
            ScheduleType.VISITATION,
            report.visitation.title,
            report.visitation.startDate,
            report.visitation.endDate,
            report.visitation.status,
          ),
        );
      } else if (
        report instanceof EducationSessionReportModel &&
        raw[index].report_reportType === ReportType.EDUCATION_SESSION
      ) {
        console.log(raw[index].report_reportType);
        console.log(raw[index]);
        console.log(report);

        return new ScheduleReportDto(
          report.id,
          ScheduleType.EDUCATION_SESSION,
          report.educationSession.inCharge
            ? report.educationSession.inCharge
            : null,
          new ScheduleDto(
            report.educationSession.id,
            ScheduleType.EDUCATION_SESSION,
            report.educationSession.title,
            report.educationSession.startDate,
            report.educationSession.endDate,
            report.educationSession.status,
            report.educationTermId,
            report.educationId,
          ),
        );
      } else if (
        report instanceof EducationTermReportModel &&
        raw[index].report_reportType === ReportType.EDUCATION_TERM
      ) {
        return new ScheduleReportDto(
          report.id,
          ScheduleType.EDUCATION_TERM,
          report.educationTerm.inCharge,
          new ScheduleDto(
            report.educationTerm.id,
            ScheduleType.EDUCATION_TERM,
            undefined,
            report.educationTerm.startDate,
            report.educationTerm.endDate,
            report.educationTerm.status,
            undefined,
            report.educationId,
            report.educationTerm.educationName,
          ),
        );
      } else {
        throw new InternalServerErrorException();
      }
    });*/
  }

  private createQuery(
    qb: SelectQueryBuilder<ReportModel>,
    reportType: 'task' | 'visitation' | 'educationSession' | 'educationTerm',
  ) {
    const alias = reportType === 'educationTerm' ? 'term' : reportType;

    qb.leftJoin(`report.${reportType}`, alias)
      .addSelect(
        alias === 'term'
          ? [
              `${alias}.id`,
              `${alias}.educationName`,
              `${alias}.term`,
              `${alias}.startDate`,
              `${alias}.endDate`,
              `${alias}.status`,
            ]
          : [
              `${alias}.id`,
              `${alias}.title`,
              `${alias}.startDate`,
              `${alias}.endDate`,
              `${alias}.status`,
            ],
      )
      .leftJoin(`${alias}.inCharge`, `${alias}_inCharge`)
      .addSelect([
        `${alias}_inCharge.id`,
        `${alias}_inCharge.name`,
        `${alias}_inCharge.profileImageUrl`,
        `${alias}_inCharge.mobilePhone`,
        `${alias}_inCharge.registeredAt`,
        `${alias}_inCharge.birth`,
        `${alias}_inCharge.isLunar`,
        `${alias}_inCharge.isLeafMonth`,
        `${alias}_inCharge.groupRole`,
        `${alias}_inCharge.ministryGroupRole`,
      ])
      .leftJoin(`${alias}_inCharge.group`, `${alias}_group`)
      .addSelect([`${alias}_group.id`, `${alias}_group.name`])
      .leftJoin(`${alias}_inCharge.officer`, `${alias}_officer`)
      .addSelect([`${alias}_officer.id`, `${alias}_officer.name`]);
  }
}
