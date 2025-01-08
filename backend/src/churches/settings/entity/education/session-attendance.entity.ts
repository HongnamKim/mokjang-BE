import { BaseModel } from '../../../../common/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { EducationSessionModel } from './education-session.entity';
import { EducationEnrollmentModel } from './education-enrollment.entity';

@Entity()
export class SessionAttendanceModel extends BaseModel {
  @Column({ comment: '교육 회차 ID' })
  educationSessionId: number;

  @ManyToOne(
    () => EducationSessionModel,
    (educationSession) => educationSession.sessionAttendances,
  )
  educationSession: EducationSessionModel;

  @Column({ comment: '교육 등록 ID' })
  educationEnrollmentId: number;

  @ManyToOne(
    () => EducationEnrollmentModel,
    (enrollment) => enrollment.sessionAttendance,
  )
  educationEnrollment: EducationEnrollmentModel;

  @Column({ comment: '출석 여부' })
  isPresent: boolean;

  @Column({ type: 'varchar', length: 120, nullable: true, comment: '비고' })
  note: string | null;
}
