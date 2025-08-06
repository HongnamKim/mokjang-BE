import { EducationModel } from '../../../educations/education/entity/education.entity';
import { EducationTermModel } from '../../../educations/education-term/entity/education-term.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { EducationTermReportModel } from '../../entity/education-term-report.entity';

export const IEDUCATION_TERM_REPORT_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_TERM_REPORT_DOMAIN_SERVICE',
);

export interface IEducationTermReportDomainService {
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

  deleteEducationTermReportsCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationSessionReports(
    targetReports: EducationTermReportModel[],
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
