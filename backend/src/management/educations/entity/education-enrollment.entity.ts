import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { EducationTermModel } from './education-term.entity';
import { EducationStatus } from '../const/education-status.enum';
import { SessionAttendanceModel } from './session-attendance.entity';
import { BaseModel } from '../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';

@Entity()
export class EducationEnrollmentModel extends BaseModel {
  @Index()
  @Column({ comment: '교육 대상자 ID' })
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.educations)
  member: MemberModel;

  @Index()
  @Column({ comment: '교육 기수 ID' })
  educationTermId: number;

  @ManyToOne(() => EducationTermModel, (term) => term.educationEnrollments)
  educationTerm: EducationTermModel;

  @Index()
  @Column({
    enum: EducationStatus,
    comment: '교육 상태 (수료중/수료/미수료)',
    default: EducationStatus.IN_PROGRESS,
  })
  status: EducationStatus;

  @Column({ default: 0, comment: '출석 횟수' })
  attendanceCount: number;

  @Column({ type: 'varchar', length: 120, nullable: true, comment: '비고' })
  note: string | null;

  @OneToMany(
    () => SessionAttendanceModel,
    (attendance) => attendance.educationEnrollment,
  )
  sessionAttendance: SessionAttendanceModel[];
}
