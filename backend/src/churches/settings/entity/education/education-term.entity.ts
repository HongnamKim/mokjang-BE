import { BaseModel } from '../../../../common/entity/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { EducationModel } from './education.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationSessionModel } from './education-session.entity';
import { EducationEnrollmentModel } from './education-enrollment.entity';

@Entity()
export class EducationTermModel extends BaseModel {
  @ManyToOne(() => EducationModel, (education) => education.educationTerms)
  education!: EducationModel;

  @Column({ comment: '기수' })
  term: number; // 기수

  @Column({ comment: '총 교육 회차' })
  numberOfSessions: number; // 총 교육 회차

  @Column({ type: 'int', nullable: true, comment: '수료 기준 출석 횟수' })
  completionCriteria: number | null;

  @Column({ type: 'timestamptz', comment: '회차 시작일' })
  startDate: Date;

  @Column({ type: 'timestamptz', comment: '회차 종료일' })
  endDate: Date;

  @Column({ comment: '교육 진행자 ID' })
  instructorId!: number;

  @ManyToOne(() => MemberModel, (member) => member.instructingEducation)
  instructor!: MemberModel;

  @OneToMany(() => EducationSessionModel, (session) => session.educationTerm)
  educationSessions: EducationSessionModel[];

  @OneToMany(
    () => EducationEnrollmentModel,
    (enrollment) => enrollment.educationTerm,
  )
  educationEnrollments: EducationEnrollmentModel[];
}
