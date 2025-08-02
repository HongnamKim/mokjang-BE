import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import { GetEducationEnrollmentDto } from '../../education-enrollment/dto/request/get-education-enrollment.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { EducationEnrollmentModel } from '../../education-enrollment/entity/education-enrollment.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationEnrollmentStatus } from '../../education-enrollment/const/education-enrollment-status.enum';

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

  findEducationEnrollmentsByIds(
    educationTerm: EducationTermModel,
    ids: number[],
    qr?: QueryRunner,
  ): Promise<EducationEnrollmentModel[]>;

  findEducationEnrollmentModelById(
    educationEnrollmentId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationEnrollmentModel>,
  ): Promise<EducationEnrollmentModel>;

  createEducationEnrollment(
    educationTerm: EducationTermModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<EducationEnrollmentModel[]>;

  updateEducationEnrollment(
    educationEnrollment: EducationEnrollmentModel,
    //dto: UpdateEducationEnrollmentDto,
    status: EducationEnrollmentStatus,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

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
