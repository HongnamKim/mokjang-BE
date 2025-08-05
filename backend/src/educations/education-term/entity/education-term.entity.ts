import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { EducationModel } from '../../education/entity/education.entity';
import { EducationSessionModel } from '../../education-session/entity/education-session.entity';
import { EducationEnrollmentModel } from '../../education-enrollment/entity/education-enrollment.entity';

import { EducationSessionConstraints } from '../../education-session/const/education-session-constraints.const';
import {
  BaseModel,
  BaseModelColumns,
} from '../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationTermStatus } from '../const/education-term-status.enum';

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
  term: number;

  @Column({ nullable: true })
  location: string; // 장소

  @Column({ default: EducationTermStatus.RESERVE })
  status: EducationTermStatus;

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

  @Column({ comment: '총 교육 회차', default: 0 })
  sessionsCount: number; // 총 교육 회차

  @Column({ default: 0, comment: '진행 완료된 교육 회차의 수' })
  completedSessionsCount: number;

  @Column({ default: 0, comment: '수강 대상 교인 수' })
  enrollmentsCount: number;

  @Column({ default: 0, comment: '수료한 교인 수' })
  completedMembersCount: number;

  /*@Column({ default: 0, comment: '미수료한 교인 수' })
  incompleteMembersCount: number;*/

  @OneToMany(
    () => EducationEnrollmentModel,
    (enrollment) => enrollment.educationTerm,
  )
  educationEnrollments: EducationEnrollmentModel[];

  canAddSession(): boolean {
    return this.sessionsCount <= EducationSessionConstraints.MAX_SESSION_NUMBER;
  }
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
  sessionsCount: 'sessionsCount',
  startDate: 'startDate',
  endDate: 'endDate',
  inChargeId: 'inChargeId',
  inCharge: 'inCharge',
  educationSessions: 'educationSessions',
  completedSessionsCount: 'completedSessionsCount',
  enrollmentsCount: 'enrollmentsCount',
  completedMembersCount: 'completedMembersCount',
  //incompleteMembersCount: 'incompleteMembersCount',
  educationEnrollments: 'educationEnrollments',
};
