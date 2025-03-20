import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationEnrollmentModel } from '../../../entity/education/education-enrollment.entity';
import { QueryRunner, Repository } from 'typeorm';
import { SessionAttendanceModel } from '../../../entity/education/session-attendance.entity';

@Injectable()
export class EducationEnrollmentAttendanceSyncService {
  constructor(
    @InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentRepository: Repository<EducationEnrollmentModel>,
    @InjectRepository(SessionAttendanceModel)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceModel>,
  ) {}

  private getSessionAttendanceRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(SessionAttendanceModel)
      : this.sessionAttendanceRepository;
  }

  createSessionAttendanceForNewEnrollment(
    enrollment: EducationEnrollmentModel,
    educationSessionIds: number[],
    qr: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    return sessionAttendanceRepository.save(
      educationSessionIds.map((sessionSessionId) => {
        return {
          educationSessionId: sessionSessionId,
          educationEnrollmentId: enrollment.id,
        };
      }),
    );
  }

  deleteSessionAttendanceByEnrollmentDeletion(
    enrollmentId: number,
    qr: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);
    return sessionAttendanceRepository.softDelete({
      educationEnrollmentId: enrollmentId,
    });
  }
}
