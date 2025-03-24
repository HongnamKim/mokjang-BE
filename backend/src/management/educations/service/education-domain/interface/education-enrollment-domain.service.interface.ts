import { EducationEnrollmentPaginationResultDto } from '../../../dto/education-enrollment-pagination-result.dto';
import { EducationTermModel } from '../../../../entity/education/education-term.entity';
import { GetEducationEnrollmentDto } from '../../../dto/enrollments/get-education-enrollment.dto';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { MemberModel } from '../../../../../churches/members/entity/member.entity';
import { EducationEnrollmentModel } from '../../../../entity/education/education-enrollment.entity';
import { CreateEducationEnrollmentDto } from '../../../dto/enrollments/create-education-enrollment.dto';
import { UpdateEducationEnrollmentDto } from '../../../dto/enrollments/update-education-enrollment.dto';

export const IEDUCATION_ENROLLMENT_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_ENROLLMENT_DOMAIN_SERVICE',
);

export interface IEducationEnrollmentsDomainService {
  findEducationEnrollments(
    educationTerm: EducationTermModel,
    dto: GetEducationEnrollmentDto,
    qr?: QueryRunner,
  ): Promise<EducationEnrollmentPaginationResultDto>;

  findMemberEducationEnrollments(
    //member: MemberModel,
    memberId: number,
    qr?: QueryRunner,
  ): Promise<EducationEnrollmentModel[]>;

  findEducationEnrollmentById(
    educationTerm: EducationTermModel,
    educationEnrollmentId: number,
    qr?: QueryRunner,
  ): Promise<EducationEnrollmentModel>;

  findEducationEnrollmentModelById(
    educationEnrollmentId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationEnrollmentModel>,
  ): Promise<EducationEnrollmentModel>;

  createEducationEnrollment(
    educationTerm: EducationTermModel,
    member: MemberModel,
    dto: CreateEducationEnrollmentDto,
    qr: QueryRunner,
  ): Promise<EducationEnrollmentModel>;

  updateEducationEnrollment(
    educationEnrollment: EducationEnrollmentModel,
    dto: UpdateEducationEnrollmentDto,
    qr: QueryRunner,
  ): Promise<EducationEnrollmentModel>;

  deleteEducationEnrollment(
    educationEnrollment: EducationEnrollmentModel,
    qr: QueryRunner,
  ): Promise<string>;

  decrementAttendanceCountBySessionDeletion(
    attendedEnrollmentIds: number[],
    qr: QueryRunner,
  ): Promise<void>;
}
