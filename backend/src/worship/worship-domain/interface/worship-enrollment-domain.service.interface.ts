import { WorshipModel } from '../../entity/worship.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';
import { GetWorshipEnrollmentsDto } from '../../dto/request/worship-enrollment/get-worship-enrollments.dto';
import { WorshipEnrollmentDomainPaginationResultDto } from '../dto/worship-enrollment-domain-pagination-result.dto';

export const IWORSHIP_ENROLLMENT_DOMAIN_SERVICE = Symbol(
  'IWORSHIP_ENROLLMENT_DOMAIN',
);

export interface IWorshipEnrollmentDomainService {
  findEnrollments(
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    groupIds?: number[],
    qr?: QueryRunner,
  ): Promise<WorshipEnrollmentDomainPaginationResultDto>;

  findEnrollmentsByQueryBuilder(
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    groupIds?: number[],
    qr?: QueryRunner,
  ): Promise<any>;

  createNewMemberEnrollments(
    newMember: MemberModel,
    worships: WorshipModel[],
    qr: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]>;

  findAllEnrollments(
    worship: WorshipModel,
    qr?: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]>;

  refreshEnrollments(
    worship: WorshipModel,
    members: MemberModel[],
    qr?: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]>;

  createEnrollmentCascade(
    newWorship: WorshipModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]>;

  deleteEnrollmentCascade(
    deletedWorship: WorshipModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  incrementPresentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementPresentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  incrementAbsentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementAbsentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
