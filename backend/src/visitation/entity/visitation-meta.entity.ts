import { BaseModel } from '../../common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { VisitationDetailModel } from './visitation-detail.entity';
import { VisitationMethod } from '../const/visitation-method.enum';
import { VisitationType } from '../const/visitation-type.enum';
import { ChurchModel } from '../../churches/entity/church.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { VisitationStatus } from '../const/visitation-status.enum';
import { VisitationReportModel } from '../../report/entity/visitation-report.entity';

@Entity()
export class VisitationMetaModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.visitations)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column({
    enum: VisitationStatus,
    comment: '심방 상태 (예약 / 완료 / 지연)',
    default: VisitationStatus.RESERVE,
  })
  status: VisitationStatus;

  @Column({ enum: VisitationMethod, comment: '심방 방식 (대면 / 비대면)' })
  visitationMethod: VisitationMethod;

  @Column({ enum: VisitationType, comment: '심방 종류 (개인 / 그룹)' })
  visitationType: VisitationType;

  @Index()
  @Column({
    type: 'timestamptz',
    comment: '심방 시작 일자',
    default: new Date('2025-01-01'),
  })
  startDate: Date;

  @Index()
  @Column({
    type: 'timestamptz',
    comment: '심방 종료 일자',
    default: new Date('2025-01-01'),
  })
  endDate: Date;

  @Column({ length: 50, comment: '심방 제목' })
  title: string;

  @Index()
  @Column({ comment: '심방 진행자 ID', nullable: true })
  inChargeId: number;

  @ManyToOne(() => MemberModel, (member) => member.inChargingVisitations)
  @JoinColumn({ name: 'instructorId' })
  inCharge: MemberModel;

  @Index()
  @Column({ comment: '심방 생성자 ID' })
  creatorId: number;

  @ManyToOne(() => MemberModel, (member) => member.createdVisitations)
  @JoinColumn({ name: 'creatorId' })
  creator: MemberModel;

  @ManyToMany(() => MemberModel, (member) => member.visitationMetas)
  @JoinTable()
  members: MemberModel[];

  @OneToMany(
    () => VisitationDetailModel,
    (visitingDetail) => visitingDetail.visitationMeta,
  )
  visitationDetails: VisitationDetailModel[];

  @OneToMany(
    () => VisitationReportModel,
    (visitingReport) => visitingReport.visitation,
  )
  reports: VisitationReportModel[];
}
