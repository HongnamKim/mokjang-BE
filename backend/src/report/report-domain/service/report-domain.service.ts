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
import { EducationReportModel } from '../../education-report/entity/education-report.entity';
//import { EducationTermReportModel } from '../../education-report/entity/education-term-report.entity';
import { GetMyReportsDto } from '../../../home/dto/request/get-my-reports.dto';
import { EducationReportType } from '../../education-report/const/education-report-type.enum';

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
    dto: GetMyReportsDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const reportsQb = repository
      .createQueryBuilder('report')
      .select([
        'report.id',
        'report.reportedAt',
        'report.reportType',
        'report.educationReportType',
      ])
      .where('report.receiverId = :receiverId', { receiverId: receiver.id });

    this.createQuery(reportsQb, 'task');
    this.createQuery(reportsQb, 'visitation');
    this.createQuery(reportsQb, 'educationSession');
    this.createQuery(reportsQb, 'educationTerm');

    const startDateCoalesce =
      'COALESCE(task.startDate, visitation.startDate, educationSession.startDate, term.startDate)';
    const endDateCoalesce =
      'COALESCE(task.endDate, visitation.endDate, educationSession.endDate, term.startDate)';

    reportsQb
      .addSelect(startDateCoalesce, 'start_date')
      .addSelect(endDateCoalesce, 'end_date')
      .andWhere(`${startDateCoalesce} <= :to`, { to })
      .andWhere(`${endDateCoalesce} >= :from`, { from })
      .orderBy('end_date', 'ASC', 'NULLS LAST')
      .limit(dto.take)
      .offset(dto.take * (dto.page - 1));

    const entities = await reportsQb.getMany();

    return entities.map((report) => {
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
        report instanceof EducationReportModel &&
        report.educationReportType === EducationReportType.SESSION
      ) {
        if (!report.educationSession) {
          throw new InternalServerErrorException();
        }

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
            report.educationTerm.id,
            report.educationTerm.educationId,
            report.educationTerm.educationName,
            report.educationTerm.term,
          ),
        );
      } else if (
        report instanceof EducationReportModel &&
        report.educationReportType === EducationReportType.TERM
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
            report.educationTerm.id, //undefined,
            report.educationTerm.educationId,
            report.educationTerm.educationName,
            report.educationTerm.term,
          ),
        );
      } else {
        throw new InternalServerErrorException();
      }
    });
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
              `${alias}.educationId`,
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
        //`${alias}_inCharge.mobilePhone`,
        //`${alias}_inCharge.registeredAt`,
        //`${alias}_inCharge.birth`,
        //`${alias}_inCharge.isLunar`,
        //`${alias}_inCharge.isLeafMonth`,
        `${alias}_inCharge.groupRole`,
        `${alias}_inCharge.ministryGroupRole`,
      ])
      .leftJoin(`${alias}_inCharge.group`, `${alias}_group`)
      .addSelect([`${alias}_group.id`, `${alias}_group.name`])
      .leftJoin(`${alias}_inCharge.officer`, `${alias}_officer`)
      .addSelect([`${alias}_officer.id`, `${alias}_officer.name`]);
  }
}
