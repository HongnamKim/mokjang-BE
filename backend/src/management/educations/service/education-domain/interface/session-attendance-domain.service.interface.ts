import { EducationSessionModel } from '../../../entity/education-session.entity';
import { GetAttendanceDto } from '../../../dto/attendance/get-attendance.dto';
import { SessionAttendancePaginationResultDto } from '../../../dto/session-attendance-pagination-result.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { SessionAttendanceModel } from '../../../entity/session-attendance.entity';
import { UpdateAttendanceDto } from '../../../dto/attendance/update-attendance.dto';
import { EducationEnrollmentModel } from '../../../entity/education-enrollment.entity';
import { EducationTermModel } from '../../../entity/education-term.entity';

export const ISESSION_ATTENDANCE_DOMAIN_SERVICE = Symbol(
  'ISESSION_ATTENDANCE_DOMAIN_SERVICE',
);

export interface ISessionAttendanceDomainService {
  createSessionAttendance(
    newSession: EducationSessionModel,
    educationEnrollments: EducationEnrollmentModel[],
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]>;

  createSessionAttendanceForNewEnrollment(
    enrollment: EducationEnrollmentModel,
    educationSessionIds: number[],
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]>;

  createAdditionalSessionAttendance(
    newSessionIds: number[],
    enrollmentIds: number[],
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]>;

  deleteSessionAttendanceByEnrollmentDeletion(
    enrollment: EducationEnrollmentModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findAttendedSessionAttendances(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]>;

  findSessionAttendances(
    educationSession: EducationSessionModel,
    dto: GetAttendanceDto,
  ): Promise<SessionAttendancePaginationResultDto>;

  findSessionAttendanceModelById(
    educationSession: EducationSessionModel,
    sessionAttendanceId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SessionAttendanceModel>,
  ): Promise<SessionAttendanceModel>;

  updateSessionAttendance(
    sessionAttendance: SessionAttendanceModel,
    dto: UpdateAttendanceDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteSessionAttendancesBySessionDeletion(
    deletedSessionId: number,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  syncSessionAttendances(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]>;
}
