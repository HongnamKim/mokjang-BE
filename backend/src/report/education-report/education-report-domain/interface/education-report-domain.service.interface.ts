import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { EducationReportModel } from '../../entity/education-report.entity';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';
import { EducationModel } from '../../../../educations/education/entity/education.entity';
import { EducationTermModel } from '../../../../educations/education-term/entity/education-term.entity';
import { EducationSessionModel } from '../../../../educations/education-session/entity/education-session.entity';
import { GetEducationSessionReportDto } from '../../dto/session/request/get-education-session-report.dto';
import { UpdateEducationSessionReportDto } from '../../dto/session/request/update-education-session-report.dto';
import { GetEducationTermReportsDto } from '../../dto/term/request/get-education-term-reports.dto';

export const IEDUCATION_REPORT_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_REPORT_DOMAIN_SERVICE',
);

export interface IEducationReportDomainService {
  findEducationSessionReports(
    receiver: MemberModel,
    dto: GetEducationSessionReportDto,
  ): Promise<EducationReportModel[]>;

  findEducationTermReports(
    receiver: MemberModel,
    dto: GetEducationTermReportsDto,
  ): Promise<EducationReportModel[]>;

  findEducationSessionReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ): Promise<EducationReportModel>;

  findEducationTermReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ): Promise<EducationReportModel>;

  findEducationSessionReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationReportModel>,
  ): Promise<EducationReportModel>;

  findEducationTermReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationReportModel>,
  ): Promise<EducationReportModel>;

  findEducationSessionReportModelsByReceiverIds(
    educationSession: EducationSessionModel,
    receiverIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationReportModel>,
  ): Promise<EducationReportModel[]>;

  findEducationTermReportModelsByReceiverIds(
    educationTerm: EducationTermModel,
    receiverIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationReportModel>,
  ): Promise<EducationReportModel[]>;

  createEducationSessionReports(
    education: EducationModel,
    educationTerm: EducationTermModel,
    educationSession: EducationSessionModel,
    receivers: ChurchUserModel[],
    qr: QueryRunner,
  ): Promise<EducationReportModel[]>;

  createEducationTermReports(
    education: EducationModel,
    educationTerm: EducationTermModel,
    newReceivers: ChurchUserModel[],
    qr: QueryRunner,
  ): Promise<EducationReportModel[]>;

  updateEducationSessionReport(
    targetReport: EducationReportModel,
    dto: UpdateEducationSessionReportDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  updateEducationTermReport(
    targetReport: EducationReportModel,
    dto: UpdateEducationSessionReportDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationSessionReportsCascade(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationTermReportsCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationSessionReport(
    deleteReport: EducationReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationTermReport(
    targetReport: EducationReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationSessionReports(
    targetReports: EducationReportModel[],
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationTermReports(
    targetReports: EducationReportModel[],
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  findMyReports(
    receiver: MemberModel,
    from: Date,
    to: Date,
  ): Promise<EducationReportModel[]>;
}
