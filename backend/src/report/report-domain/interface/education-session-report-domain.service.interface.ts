import { QueryRunner } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationSessionReportModel } from '../../entity/education-session-report.entity';
import { EducationModel } from '../../../management/educations/entity/education.entity';
import { EducationTermModel } from '../../../management/educations/entity/education-term.entity';
import { EducationSessionModel } from '../../../management/educations/entity/education-session.entity';

export const IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE',
);

export interface IEducationSessionReportDomainService {
  findEducationSessionReportById(
    receiver: MemberModel,
    reportId: number,
    checkIsRead: boolean,
    qr?: QueryRunner,
  ): Promise<EducationSessionReportModel>;

  createSingleReport(
    education: EducationModel,
    educationTerm: EducationTermModel,
    educationSession: EducationSessionModel,
    receiver: MemberModel,
    qr: QueryRunner,
  ): Promise<EducationSessionReportModel>;
}
