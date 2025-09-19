import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import { SessionAttendanceModel } from '../../session-attendance/entity/session-attendance.entity';
import { BaseModel } from '../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationEnrollmentStatus } from '../const/education-enrollment-status.enum';

@Entity()
export class EducationEnrollmentModel extends BaseModel {
  @Index()
  @Column({ comment: '교육 대상자 ID' })
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.educationEnrollments, {
    onDelete: 'CASCADE',
  })
  member: MemberModel;

  @Index()
  @Column({ comment: '교육 기수 ID' })
  educationTermId: number;

  @ManyToOne(() => EducationTermModel, (term) => term.educationEnrollments, {
    onDelete: 'CASCADE',
  })
  educationTerm: EducationTermModel;

  @Index()
  @Column({
    enum: EducationEnrollmentStatus,
    comment: '교육 상태 (수료중/수료/미수료)',
    default: EducationEnrollmentStatus.INCOMPLETE,
  })
  status: EducationEnrollmentStatus;

  @Column({ default: 0, comment: '출석 횟수' })
  attendancesCount: number;

  @OneToMany(
    () => SessionAttendanceModel,
    (attendance) => attendance.educationEnrollment,
  )
  sessionAttendance: SessionAttendanceModel[];
}
