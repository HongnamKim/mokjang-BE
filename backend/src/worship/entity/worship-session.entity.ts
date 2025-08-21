import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { WorshipModel } from './worship.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { WorshipAttendanceModel } from './worship-attendance.entity';

@Entity()
export class WorshipSessionModel extends BaseModel {
  @Index()
  @Column()
  worshipId: number;

  @ManyToOne(() => WorshipModel)
  @JoinColumn({ name: 'worshipId' })
  worship: WorshipModel;

  @Index()
  @Column({ type: 'timestamptz' })
  sessionDate: Date;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  bibleTitle: string;

  @Column({ default: '' })
  videoUrl: string;

  @Column({ default: '' })
  description: string;

  @Column({ nullable: true })
  inChargeId: number | null;

  @ManyToOne(() => MemberModel, { nullable: true })
  @JoinColumn({ name: 'inChargeId' })
  inCharge: MemberModel | null;

  @OneToMany(
    () => WorshipAttendanceModel,
    (attendance) => attendance.worshipSession,
  )
  worshipAttendances: WorshipAttendanceModel[];
}
