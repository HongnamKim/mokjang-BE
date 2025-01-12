import { BaseModel } from '../../../../common/entity/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { EducationTermModel } from './education-term.entity';
import { SessionAttendanceModel } from './session-attendance.entity';

@Entity()
export class EducationSessionModel extends BaseModel {
  @Column()
  educationTermId: number;

  @ManyToOne(() => EducationTermModel, (term) => term.educationSessions)
  educationTerm: EducationTermModel;

  @Column({ comment: '교육 회차' })
  session: number; // 회차

  @Column({ comment: '해당 교육 회차 진행 여부', default: false })
  isCompleted: boolean;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '교육 진행 내용',
    nullable: true,
  })
  content: string | null;

  @OneToMany(
    () => SessionAttendanceModel,
    (attendance) => attendance.educationSession,
  )
  sessionAttendances: SessionAttendanceModel[];
}
