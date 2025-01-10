import { BaseModel } from '../../../../common/entity/base.entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { EducationModel } from './education.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationSessionModel } from './education-session.entity';
import { EducationEnrollmentModel } from './education-enrollment.entity';

@Entity()
export class EducationTermModel extends BaseModel {
  @Column({ comment: '교육 ID' })
  @Index()
  educationId: number;

  @Column({ comment: '교육 이름', nullable: true })
  educationName: string;

  @ManyToOne(() => EducationModel, (education) => education.educationTerms)
  education!: EducationModel;

  @Column({ comment: '기수' })
  @Index()
  term: number; // 기수

  @Column({ comment: '총 교육 회차' })
  numberOfSessions: number; // 총 교육 회차

  @Column({ type: 'int', nullable: true, comment: '수료 기준 출석 횟수' })
  completionCriteria: number | null;

  @Column({ type: 'timestamptz', comment: '회차 시작일' })
  startDate: Date;

  @Column({ type: 'timestamptz', comment: '회차 종료일' })
  endDate: Date;

  @Column({ type: 'int', comment: '교육 진행자 ID', nullable: true })
  instructorId!: number | null;

  @ManyToOne(() => MemberModel, (member) => member.instructingEducation)
  instructor!: MemberModel;

  @OneToMany(() => EducationSessionModel, (session) => session.educationTerm)
  educationSessions: EducationSessionModel[];

  @Column({ default: 0, comment: '수료중인 교인 수' })
  inProgressCount: number;

  @Column({ default: 0, comment: '수료한 교인 수' })
  completedCount: number;

  @Column({ default: 0, comment: '미수료한 교인 수' })
  incompleteCount: number;

  @OneToMany(
    () => EducationEnrollmentModel,
    (enrollment) => enrollment.educationTerm,
  )
  educationEnrollments: EducationEnrollmentModel[];
}
