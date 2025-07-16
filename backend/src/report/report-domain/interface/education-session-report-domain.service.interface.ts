import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationSessionReportModel } from '../../entity/education-session-report.entity';
import { EducationModel } from '../../../management/educations/entity/education.entity';
import { EducationTermModel } from '../../../management/educations/entity/education-term.entity';
import { EducationSessionModel } from '../../../management/educations/entity/education-session.entity';
import { EducationSessionReportDomainPaginationResultDto } from '../../dto/education-report/session/response/education-session-report-domain-pagination-result.dto';
import { GetEducationSessionReportDto } from '../../dto/education-report/session/request/get-education-session-report.dto';
import { UpdateEducationSessionReportDto } from '../../dto/education-report/session/request/update-education-session-report.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

export const IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE',
);

export interface IEducationSessionReportDomainService {
  findEducationSessionReports(
    receiver: MemberModel,
    dto: GetEducationSessionReportDto,
  ): Promise<EducationSessionReportDomainPaginationResultDto>;

  findEducationSessionReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ): Promise<EducationSessionReportModel>;

  findEducationSessionReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationSessionReportModel>,
  ): Promise<EducationSessionReportModel>;

  createEducationSessionReports(
    education: EducationModel,
    educationTerm: EducationTermModel,
    educationSession: EducationSessionModel,
    receivers: ChurchUserModel[],
    qr: QueryRunner,
  ): Promise<EducationSessionReportModel[]>;

  updateEducationSessionReport(
    targetReport: EducationSessionReportModel,
    dto: UpdateEducationSessionReportDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationSessionReportsCascade(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationSessionReport(
    deleteReport: EducationSessionReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationSessionReports(
    educationSession: EducationSessionModel,
    deleteReceiverIds: number[],
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  findMyReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
  ): Promise<EducationSessionReportModel[]>;
}
