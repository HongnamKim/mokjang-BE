import { GetWorshipAttendancesDto } from 'src/worship/dto/request/worship-attendance/get-worship-attendances.dto';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import { WorshipAttendanceDomainPaginationResultDto } from '../dto/worship-attendance-domain-pagination-result.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { WorshipAttendanceModel } from '../../entity/worship-attendance.entity';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';
import { UpdateWorshipAttendanceDto } from '../../dto/request/worship-attendance/update-worship-attendance.dto';

export const IWORSHIP_ATTENDANCE_DOMAIN_SERVICE = Symbol(
  'IWORSHIP_ATTENDANCE_DOMAIN_SERVICE',
);

export interface IWorshipAttendanceDomainService {
  findAttendances(
    session: WorshipSessionModel,
    dto: GetWorshipAttendancesDto,
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceDomainPaginationResultDto>;

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
}
