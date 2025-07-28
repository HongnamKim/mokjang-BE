import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  TableInheritance,
} from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { MinistryGroupHistoryModel } from './ministry-group-history.entity';
import { BaseModel } from '../../../common/entity/base.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class MinistryGroupDetailHistoryModel extends BaseModel {
  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel)
  member: MemberModel;

  @Index()
  @Column()
  ministryGroupHistoryId: number;

  @ManyToOne(() => MinistryGroupHistoryModel)
  @JoinColumn({ name: 'ministryGroupHistoryId' })
  ministryGroupHistory: MinistryGroupHistoryModel;

  @Index()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;
}
