import { EducationTermModel } from '../../../entity/education-term.entity';
import { GetEducationEnrollmentDto } from '../../../dto/enrollments/get-education-enrollment.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { EducationEnrollmentModel } from '../../../entity/education-enrollment.entity';
import { CreateEducationEnrollmentDto } from '../../../dto/enrollments/create-education-enrollment.dto';
import { UpdateEducationEnrollmentDto } from '../../../dto/enrollments/update-education-enrollment.dto';
import { MemberModel } from '../../../../members/entity/member.entity';

export const IEDUCATION_ENROLLMENT_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_ENROLLMENT_DOMAIN_SERVICE',
);

export interface IEducationEnrollmentsDomainService {
  findEducationEnrollments(
    educationTerm: EducationTermModel,
    dto: GetEducationEnrollmentDto,
    qr?: QueryRunner,
  ): Promise<{ data: EducationEnrollmentModel[]; totalCount: number }>;

  findEducationEnrollmentModels(
    educationTerm: EducationTermModel,
    qr?: QueryRunner,
  ): Promise<EducationEnrollmentModel[]>;

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

  deleteEducationEnrollmentsCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<void>;

  incrementAttendanceCount(
    educationEnrollment: EducationEnrollmentModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementAttendanceCount(
    educationEnrollment: EducationEnrollmentModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementAttendanceCountBySessionDeletion(
    attendedEnrollmentIds: number[],
    qr: QueryRunner,
  ): Promise<void>;
}
