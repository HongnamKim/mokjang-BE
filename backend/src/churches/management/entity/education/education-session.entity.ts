import { BaseModel } from '../../../../common/entity/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { EducationTermModel } from './education-term.entity';
import { SessionAttendanceModel } from './session-attendance.entity';

@Entity()
export class EducationSessionModel extends BaseModel {
  @Column({ comment: '교육 기수 ID' })
  educationTermId: number;

  @ManyToOne(() => EducationTermModel, (term) => term.educationSessions)
  educationTerm: EducationTermModel;

  @Column({ comment: '교육 회차' })
  session: number; // 회차

  @Column({
    type: 'varchar',
    length: 500,
    comment: '교육 진행 내용',
    nullable: true,
  })
  content: string | null;

  @Column({ type: 'timestamptz', comment: '교육 진행 날짜', nullable: true })
  sessionDate: Date;

  @Column({ default: false, comment: '교육 진행 여부' })
  isDone: boolean;

  @OneToMany(
    () => SessionAttendanceModel,
    (attendance) => attendance.educationSession,
  )
  sessionAttendances: SessionAttendanceModel[];
}
