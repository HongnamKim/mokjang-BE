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

export const IWORSHIP_ATTENDANCE_DOMAIN_SERVICE = Symbol(
  'IWORSHIP_ATTENDANCE_DOMAIN_SERVICE',
);

export interface IWorshipAttendanceDomainService {
  findAttendanceList(
    session: WorshipSessionModel,
    dto: GetWorshipAttendanceListDto,
    groupIds: number[] | undefined,
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

  getAttendanceStatsBySession(
    worshipSession: WorshipSessionModel,
    requestGroupIds: number[] | undefined,
    qr?: QueryRunner,
  ): Promise<{
    presentCount: number;
    absentCount: number;
    unknownCount: number;
  }>;

  getAttendanceStatsByWorship(
    worship: WorshipModel,
    requestGroupIds: number[] | undefined,
  ): Promise<number>;

  getMovingAverageAttendance(
    worship: WorshipModel,
    requestGroupIds: number[] | undefined,
  ): Promise<{ last4Weeks: number; last12Weeks: number }>;
}
