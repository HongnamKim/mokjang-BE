import { InjectRepository } from '@nestjs/typeorm';
import { EducationEnrollmentModel } from '../../../entity/education-enrollment.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { SessionAttendanceModel } from '../../../entity/session-attendance.entity';

//@Injectable()
/*export*/ class EducationEnrollmentSessionSyncService {
  constructor(
    @InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentRepository: Repository<EducationEnrollmentModel>,
    @InjectRepository(SessionAttendanceModel)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceModel>,
  ) {}

  private getEducationEnrollmentsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationEnrollmentModel)
      : this.educationEnrollmentRepository;
  }

  async decreaseAttendanceCount(
    attendedEnrollmentIds: number[],
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    await educationEnrollmentsRepository.decrement(
      { id: In(attendedEnrollmentIds) },
      'attendanceCount',
      1,
    );
  }
}
