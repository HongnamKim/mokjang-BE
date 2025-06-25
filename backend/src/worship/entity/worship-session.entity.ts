import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { WorshipModel } from './worship.entity';
import { MemberModel } from '../../members/entity/member.entity';

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
  inChargeId: number;

  @ManyToOne(() => MemberModel)
  @JoinColumn({ name: 'inChargeId' })
  inCharge: MemberModel;
}
