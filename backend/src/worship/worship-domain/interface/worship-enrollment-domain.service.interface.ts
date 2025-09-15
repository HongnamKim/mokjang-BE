import { WorshipModel } from '../../entity/worship.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';
import { GetWorshipEnrollmentsDto } from '../../dto/request/worship-enrollment/get-worship-enrollments.dto';
import { GetLowWorshipAttendanceMembersDto } from '../../../home/dto/request/get-low-worship-attendance-members.dto';
import { WorshipAttendanceModel } from '../../entity/worship-attendance.entity';

export const IWORSHIP_ENROLLMENT_DOMAIN_SERVICE = Symbol(
  'IWORSHIP_ENROLLMENT_DOMAIN',
);

export interface IWorshipEnrollmentDomainService {
  /*findEnrollments(
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    groupIds?: number[],
    qr?: QueryRunner,
  ): Promise<WorshipEnrollmentDomainPaginationResultDto>;*/

  findEnrollmentsByQueryBuilder(
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    groupIds?: number[],
    qr?: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]>;

  createNewMemberEnrollments(
    newMember: MemberModel,
    worships: WorshipModel[],
    qr: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]>;

  findAllEnrollments(
    worship: WorshipModel,
    qr?: QueryRunner,
    sessionDate?: Date,
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

  findLowAttendanceEnrollments(
    worship: WorshipModel,
    from: Date,
    to: Date,
    dto: GetLowWorshipAttendanceMembersDto,
    groupIds: number[],
  ): Promise<any[]>;

  /*updatePresentAbsentCount(
    enrollment: WorshipEnrollmentModel,
    presentCount: number,
    absentCount: number,
  ): Promise<UpdateResult>;*/

  incrementPresentCounts(
    worshipAttendanceModels: WorshipAttendanceModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementAbsentCounts(
    worshipAttendance: WorshipAttendanceModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findEnrollmentsByMemberId(
    memberId: number,
  ): Promise<WorshipEnrollmentModel[]>;
}
