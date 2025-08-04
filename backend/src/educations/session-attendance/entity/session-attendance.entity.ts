import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { EducationSessionModel } from '../../education-session/entity/education-session.entity';
import { EducationEnrollmentModel } from '../../education-enrollment/entity/education-enrollment.entity';
import { BaseModel } from '../../../common/entity/base.entity';
import { SessionAttendanceStatus } from '../const/session-attendance-status.enum';

@Entity()
export class SessionAttendanceModel extends BaseModel {
  @Index()
  @Column({ comment: '교육 회차 ID' })
  educationSessionId: number;

  @ManyToOne(
    () => EducationSessionModel,
    (educationSession) => educationSession.sessionAttendances,
  )
  educationSession: EducationSessionModel;

  @Index()
  @Column({ comment: '교육 등록 ID' })
  educationEnrollmentId: number;

  @ManyToOne(
    () => EducationEnrollmentModel,
    (enrollment) => enrollment.sessionAttendance,
  )
  educationEnrollment: EducationEnrollmentModel;

  @Index()
  @Column({ default: SessionAttendanceStatus.NONE, comment: '출석 여부' })
  status: SessionAttendanceStatus;

  @Column({ type: 'varchar', length: 100, default: '', comment: '비고' })
  note: string;
}
