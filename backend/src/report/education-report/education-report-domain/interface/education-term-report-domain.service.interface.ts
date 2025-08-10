import { EducationModel } from '../../../../educations/education/entity/education.entity';
import { EducationTermModel } from '../../../../educations/education-term/entity/education-term.entity';
import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { EducationTermReportModel } from '../../entity/education-term-report.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GetEducationTermReportsDto } from '../../dto/term/request/get-education-term-reports.dto';
import { UpdateEducationTermReportDto } from '../../dto/term/request/update-education-term-report.dto';

export const IEDUCATION_TERM_REPORT_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_TERM_REPORT_DOMAIN_SERVICE',
);

export interface IEducationTermReportDomainService {
  findEducationTermReports(
    currentMember: MemberModel,
    dto: GetEducationTermReportsDto,
    qr?: QueryRunner,
  ): Promise<EducationTermReportModel[]>;

  findEducationTermReportModelById(
    receiver: MemberModel,
    reportId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationTermReportModel>,
  ): Promise<EducationTermReportModel>;

  findEducationTermReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ): Promise<EducationTermReportModel>;

  findEducationTermReportModelsByReceiverIds(
    educationTerm: EducationTermModel,
    receiverIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationTermReportModel>,
  ): Promise<EducationTermReportModel[]>;

  createEducationTermReports(
    education: EducationModel,
    educationTerm: EducationTermModel,
    newReceivers: ChurchUserModel[],
    qr: QueryRunner,
  ): Promise<EducationTermReportModel[]>;

  updateEducationTermReport(
    targetReport: EducationTermReportModel,
    dto: UpdateEducationTermReportDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationTermReportsCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationTermReports(
    targetReports: EducationTermReportModel[],
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationTermReport(
    targetReport: EducationTermReportModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
