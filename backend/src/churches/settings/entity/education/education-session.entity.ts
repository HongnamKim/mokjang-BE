import { BaseModel } from '../../../../common/entity/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { EducationTermModel } from './education-term.entity';
import { SessionAttendanceModel } from './session-attendance.entity';

@Entity()
export class EducationSessionModel extends BaseModel {
  @ManyToOne(() => EducationTermModel, (term) => term.educationSessions)
  educationTerm: EducationTermModel;

  @Column({ comment: '교육 회차' })
  session: number; // 회차

  @Column({ length: 120, comment: '교육 진행 내용' })
  content: string;

  @OneToMany(
    () => SessionAttendanceModel,
    (attendance) => attendance.educationSession,
  )
  sessionAttendances: SessionAttendanceModel[];
}
