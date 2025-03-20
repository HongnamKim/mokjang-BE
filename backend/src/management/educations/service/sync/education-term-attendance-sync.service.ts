import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationTermModel } from '../../../entity/education/education-term.entity';
import { QueryRunner, Repository } from 'typeorm';
import { SessionAttendanceModel } from '../../../entity/education/session-attendance.entity';

@Injectable()
export class EducationTermAttendanceSyncService {
  constructor(
    @InjectRepository(EducationTermModel)
    private readonly educationTermRepository: Repository<EducationTermModel>,
    @InjectRepository(SessionAttendanceModel)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceModel>,
  ) {}

  private getSessionAttendanceRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(SessionAttendanceModel)
      : this.sessionAttendanceRepository;
  }

  private getEducationTermsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermRepository;
  }

  async createAdditionalSessionAttendance(
    newSessionIds: number[],
    enrollmentIds: number[],
    qr: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const attendances = newSessionIds.flatMap((sessionId) =>
      enrollmentIds.map((enrollmentId) => ({
        educationSessionId: sessionId,
        educationEnrollmentId: enrollmentId,
      })),
    );

    await sessionAttendanceRepository.save(attendances);
  }

  async syncSessionAttendances(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr: QueryRunner,
  ) {
    type AttendanceKey = {
      educationSessionId: number;
      educationEnrollmentId: number;
    };

    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const [currentSessionAttendances, educationTerm] = await Promise.all([
      sessionAttendanceRepository.find({
        where: {
          educationSession: {
            educationTermId,
          },
        },
        order: {
          educationEnrollmentId: 'asc',
          educationSessionId: 'asc',
        },
        select: {
          educationSessionId: true,
          educationEnrollmentId: true,
        },
      }),

      educationTermsRepository.findOne({
        where: {
          id: educationTermId,
          educationId,
          education: {
            churchId,
          },
        },
        relations: {
          educationSessions: true,
          educationEnrollments: true,
        },
        select: {
          educationSessions: {
            id: true,
          },
          educationEnrollments: {
            id: true,
          },
        },
      }),
    ]);

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    const totalExpectedAttendances =
      educationTerm.educationEnrollments.length *
      educationTerm.educationSessions.length;

    if (currentSessionAttendances.length === totalExpectedAttendances) {
      throw new BadRequestException('모든 출석 정보가 이미 존재합니다.');
    }

    const createAttendanceKey = (attendance: AttendanceKey) =>
      `${attendance.educationSessionId}-${attendance.educationEnrollmentId}`;

    const currentAttendancesMap = new Set(
      currentSessionAttendances.map(createAttendanceKey),
    );

    const missingAttendances = educationTerm.educationEnrollments
      .flatMap((enrollment) =>
        educationTerm.educationSessions.map((session) => ({
          educationSessionId: session.id,
          educationEnrollmentId: enrollment.id,
        })),
      )
      .filter(
        (attendance) =>
          !currentAttendancesMap.has(createAttendanceKey(attendance)),
      );

    if (missingAttendances.length > 0) {
      return sessionAttendanceRepository.save(missingAttendances);
    }

    return [];
  }
}
