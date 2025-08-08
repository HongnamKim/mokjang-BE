import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationSessionReportModel } from '../../entity/education-session-report.entity';
import { EducationSessionReportDomainPaginationResultDto } from '../../dto/education-report/session/response/education-session-report-domain-pagination-result.dto';
import { GetEducationSessionReportDto } from '../../dto/education-report/session/request/get-education-session-report.dto';
import { UpdateEducationSessionReportDto } from '../../dto/education-report/session/request/update-education-session-report.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { EducationModel } from '../../../educations/education/entity/education.entity';
import { EducationTermModel } from '../../../educations/education-term/entity/education-term.entity';
import { EducationSessionModel } from '../../../educations/education-session/entity/education-session.entity';

export const IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE',
);

export interface IEducationSessionReportDomainService {
  findEducationSessionReports(
    receiver: MemberModel,
    dto: GetEducationSessionReportDto,
  ): Promise<EducationSessionReportModel[]>;

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

  findEducationSessionReportModelsByReceiverIds(
    educationSession: EducationSessionModel,
    receiverIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationSessionReportModel>,
  ): Promise<EducationSessionReportModel[]>;

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
    targetReports: EducationSessionReportModel[],
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  findMyReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
  ): Promise<EducationSessionReportModel[]>;
}
