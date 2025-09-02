import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import { SessionAttendanceModel } from '../../session-attendance/entity/session-attendance.entity';
import { EducationSessionStatus } from '../const/education-session-status.enum';
import { BaseModel } from '../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationReportModel } from '../../../report/education-report/entity/education-report.entity';

@Entity()
export class EducationSessionModel extends BaseModel {
  @Index()
  @Column({ comment: '교육 기수 ID' })
  educationTermId: number;

  @ManyToOne(() => EducationTermModel, (term) => term.educationSessions, {
    onDelete: 'CASCADE',
  })
  educationTerm: EducationTermModel;

  @Column({ comment: '교육 회차' })
  session: number; // 회차

  @Column({ comment: '교육 회차명' })
  title: string;

  @Column({
    default: '',
    comment: '교육 진행 내용 (plain text 1000자)',
  })
  content: string;

  @Column({
    type: 'timestamptz',
    comment: '교육 회차 시작 날까',
  })
  startDate: Date;

  @Column({
    type: 'timestamptz',
    comment: '교육 회차 종료 날짜',
  })
  endDate: Date;

  @Column({
    enum: EducationSessionStatus,
    default: EducationSessionStatus.RESERVE,
    comment: '교육 진행 상태 (예정, 진행중, 완료, 지연)',
  })
  status: EducationSessionStatus;

  @Column({ nullable: true, comment: '회차 담당자 교인 ID' })
  inChargeId: number | null;

  @ManyToOne(() => MemberModel, (member) => member.inChargeEducationSession, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  inCharge: MemberModel;

  @OneToMany(
    () => SessionAttendanceModel,
    (attendance) => attendance.educationSession,
  )
  sessionAttendances: SessionAttendanceModel[];

  @Column({ default: 0 })
  attendancesCount: number;

  @Column({ nullable: true })
  creatorId: number | null;

  @ManyToOne(() => MemberModel, { nullable: true, onDelete: 'SET NULL' })
  creator: MemberModel;

  @OneToMany(() => EducationReportModel, (report) => report.educationSession)
  reports: EducationReportModel[];
}
