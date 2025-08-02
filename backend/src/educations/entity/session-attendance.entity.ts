import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { EducationSessionModel } from './education-session.entity';
import { EducationEnrollmentModel } from './education-enrollment.entity';
import { BaseModel } from '../../common/entity/base.entity';

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
  @Column({ type: 'boolean', comment: '출석 여부', nullable: true })
  isPresent: boolean | null;

  @Column({ type: 'varchar', length: 120, nullable: true, comment: '비고' })
  note: string | null;
}
