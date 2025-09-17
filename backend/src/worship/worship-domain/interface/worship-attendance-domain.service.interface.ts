import { GetWorshipAttendancesDto } from 'src/worship/dto/request/worship-attendance/get-worship-attendances.dto';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import { WorshipAttendanceDomainPaginationResultDto } from '../dto/worship-attendance-domain-pagination-result.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { WorshipAttendanceModel } from '../../entity/worship-attendance.entity';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';
import { UpdateWorshipAttendanceDto } from '../../dto/request/worship-attendance/update-worship-attendance.dto';
import { WorshipModel } from '../../entity/worship.entity';
import { GetWorshipAttendanceListDto } from '../../dto/request/worship-attendance/get-worship-attendance-list.dto';
import { DomainCursorPaginationResultDto } from '../../../common/dto/domain-cursor-pagination-result.dto';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetMemberWorshipAttendancesDto } from '../../../members/dto/request/worship/get-member-worship-attendances.dto';
import { WorshipGroupIdsVo } from '../../vo/worship-group-ids.vo';

export const IWORSHIP_ATTENDANCE_DOMAIN_SERVICE = Symbol(
  'IWORSHIP_ATTENDANCE_DOMAIN_SERVICE',
);

export interface IWorshipAttendanceDomainService {
  findAttendanceList(
    session: WorshipSessionModel,
    dto: GetWorshipAttendanceListDto,
    groupIds: WorshipGroupIdsVo,
    qr?: QueryRunner,
  ): Promise<DomainCursorPaginationResultDto<WorshipAttendanceModel>>;

  findAttendances(
    session: WorshipSessionModel,
    dto: GetWorshipAttendancesDto,
    groupIds?: number[],
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceDomainPaginationResultDto>;

  joinAttendance(
    enrollmentIds: number[],
    fromSessionDate?: Date,
    toSessionDate?: Date,
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceModel[]>;

  findAllAttendances(
    session: WorshipSessionModel,
    qr: QueryRunner,
  ): Promise<WorshipAttendanceModel[]>;

  refreshAttendances(
    session: WorshipSessionModel,
    notExistAttendanceEnrollments: WorshipEnrollmentModel[],
    qr: QueryRunner,
  ): Promise<WorshipAttendanceModel[]>;

  findWorshipAttendanceModelById(
    session: WorshipSessionModel,
    attendanceId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<WorshipAttendanceModel>,
  ): Promise<WorshipAttendanceModel>;

  findWorshipAttendanceById(
    session: WorshipSessionModel,
    attendanceId: number,
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceModel>;

  updateAttendance(
    targetAttendance: WorshipAttendanceModel,
    dto: UpdateWorshipAttendanceDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteAttendanceCascadeSession(
    session: WorshipSessionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteAttendanceCascadeWorship(
    deletedSessionIds: number[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteAttendanceCascadeEnrollment(
    targetEnrollments: WorshipEnrollmentModel[],
  ): Promise<UpdateResult>;

  getAttendanceStatsBySession(
    worshipSession: WorshipSessionModel,
    requestGroupIds: WorshipGroupIdsVo,
    qr?: QueryRunner,
  ): Promise<{
    presentCount: number;
    absentCount: number;
    unknownCount: number;
  }>;

  getOverallAttendanceStats(
    worship: WorshipModel,
    requestGroupIds: WorshipGroupIdsVo,
  ): Promise<{ overallRate: number; attendanceCheckRate: number }>;

  getAttendanceStatsByPeriod(
    worship: WorshipModel,
    requestGroupIds: WorshipGroupIdsVo,
    from: Date,
    to: Date | undefined,
  ): Promise<{ rate: number; attendanceCheckRate: number }>;

  getStatisticsByMemberAndPeriod(
    member: MemberModel,
    worship: WorshipModel,
    utcFrom: Date,
    utcTo: Date,
  ): any;

  findMemberWorshipAttendances(
    member: MemberModel,
    worship: WorshipModel,
    dto: GetMemberWorshipAttendancesDto,
  ): Promise<DomainCursorPaginationResultDto<WorshipAttendanceModel>>;

  findUnknownAttendances(
    session: WorshipSessionModel,
    groupIds: WorshipGroupIdsVo,
    qr: QueryRunner,
  ): Promise<WorshipAttendanceModel[]>;

  findAbsentAttendances(
    session: WorshipSessionModel,
    groupIds: WorshipGroupIdsVo,
    qr: QueryRunner,
  ): Promise<WorshipAttendanceModel[]>;

  updateAllAttended(
    updateTargetIds: number[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
