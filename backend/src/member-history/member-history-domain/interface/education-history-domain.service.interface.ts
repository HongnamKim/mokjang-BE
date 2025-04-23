import { MemberModel } from '../../../members/entity/member.entity';
import { GetEducationHistoryDto } from '../../dto/education/get-education-history.dto';
import { QueryRunner } from 'typeorm';
import { EducationEnrollmentModel } from '../../../management/educations/entity/education-enrollment.entity';

export const IEDUCATION_HISTORY_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_HISTORY_DOMAIN_SERVICE',
);

export interface IEducationHistoryDomainService {
  paginateEducationHistory(
    member: MemberModel,
    dto: GetEducationHistoryDto,
    qr?: QueryRunner,
  ): Promise<{
    educationHistories: EducationEnrollmentModel[];
    totalCount: number;
  }>;
}
