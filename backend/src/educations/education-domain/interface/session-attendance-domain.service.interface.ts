import { EducationSessionModel } from '../../education-session/entity/education-session.entity';
import { GetAttendanceDto } from '../../session-attendance/dto/request/get-attendance.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { SessionAttendanceModel } from '../../session-attendance/entity/session-attendance.entity';
import { EducationEnrollmentModel } from '../../education-enrollment/entity/education-enrollment.entity';
import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import { UpdateAttendanceNoteDto } from '../../session-attendance/dto/request/update-attendance-note.dto';
import { UpdateAttendancePresentDto } from '../../session-attendance/dto/request/update-attendance-present.dto';

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
    enrollments: EducationEnrollmentModel[],
    educationSessionIds: number[],
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]>;

  createAdditionalSessionAttendance(
    newSessionIds: number[],
    enrollmentIds: number[],
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]>;

  deleteSessionAttendanceCascade(
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
  ): Promise<SessionAttendanceModel[]>;

  findSessionAttendanceModelById(
    educationSession: EducationSessionModel,
    sessionAttendanceId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SessionAttendanceModel>,
  ): Promise<SessionAttendanceModel>;

  findUnAttended(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]>;

  bulkAttendance(
    sessionAttendances: SessionAttendanceModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateSessionAttendance(
    sessionAttendance: SessionAttendanceModel,
    dto: UpdateAttendanceNoteDto | UpdateAttendancePresentDto,
    qr?: QueryRunner,
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
