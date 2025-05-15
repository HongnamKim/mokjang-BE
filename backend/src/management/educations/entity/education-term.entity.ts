import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { EducationModel } from './education.entity';
import { EducationSessionModel } from './education-session.entity';
import { EducationEnrollmentModel } from './education-enrollment.entity';
import {
  BaseModel,
  BaseModelColumns,
} from '../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationStatus } from '../const/education-status.enum';

@Entity()
export class EducationTermModel extends BaseModel {
  @Column({ comment: '교육 ID' })
  @Index()
  educationId: number;

  @Column({ comment: '교육 이름' })
  educationName: string;

  @ManyToOne(() => EducationModel, (education) => education.educationTerms)
  education!: EducationModel;

  @Column({ nullable: true })
  creatorId: number;

  @ManyToOne(() => MemberModel)
  creator: MemberModel;

  @Column({ comment: '교육 기수' })
  @Index()
  term: number; // 기수

  @Column({ default: EducationStatus.RESERVE })
  status: EducationStatus;

  @Column({ comment: '총 교육 회차', default: 0 })
  numberOfSessions: number; // 총 교육 회차

  @Column({ type: 'timestamptz', comment: '기수 시작일' })
  startDate: Date;

  @Column({ type: 'timestamptz', comment: '기수 종료일' })
  endDate: Date;

  @Index()
  @Column({ type: 'int', comment: '교육 진행자 ID', nullable: true })
  inChargeId!: number | null;

  @ManyToOne(() => MemberModel, (member) => member.inChargeEducationTerm)
  inCharge!: MemberModel;

  @OneToMany(() => EducationSessionModel, (session) => session.educationTerm)
  educationSessions: EducationSessionModel[];

  @Column({ default: 0, comment: '진행 완료된 교육 회차의 수' })
  isDoneCount: number;

  @Column({ default: 0, comment: '수강 대상 교인 수' })
  enrollmentCount: number;

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

  //@Column({ type: 'int', nullable: true, comment: '수료 기준 출석 횟수' })
  //completionCriteria: number | null;
}

export const EducationTermColumns = {
  ...BaseModelColumns,
  educationId: 'educationId',
  education: 'education',
  educationName: 'educationName',
  creatorId: 'creatorId',
  creator: 'creator',
  term: 'term',
  status: 'status',
  numberOfSessions: 'numberOfSessions',
  startDate: 'startDate',
  endDate: 'endDate',
  inChargeId: 'inChargeId',
  inCharge: 'inCharge',
  educationSessions: 'educationSessions',
  isDoneCount: 'isDoneCount',
  enrollmentCount: 'enrollmentCount',
  inProgressCount: 'inProgressCount',
  completedCount: 'completedCount',
  incompleteCount: 'incompleteCount',
  educationEnrollments: 'educationEnrollments',
};
