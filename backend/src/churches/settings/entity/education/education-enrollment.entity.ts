import { BaseModel } from '../../../../common/entity/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { EducationTermModel } from './education-term.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationStatus } from '../../../members-settings/const/education-status.enum';
import { SessionAttendanceModel } from './session-attendance.entity';

@Entity()
export class EducationEnrollmentModel extends BaseModel {
  @Column({ comment: '교육 대상자 ID' })
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.educationEnrollments)
  member: MemberModel;

  @Column({ comment: '교육 기수 ID' })
  educationTermId: number;

  @ManyToOne(() => EducationTermModel, (term) => term.educationEnrollments)
  educationTerm: EducationTermModel;

  @Column({ enum: EducationStatus, comment: '교육 상태 (수료중/수료/미수료)' })
  status: EducationStatus;

  @OneToMany(
    () => SessionAttendanceModel,
    (attendance) => attendance.educationEnrollment,
  )
  sessionAttendance: SessionAttendanceModel[];
}
