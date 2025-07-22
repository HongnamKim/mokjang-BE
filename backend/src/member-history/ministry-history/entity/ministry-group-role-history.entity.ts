import { BaseModel } from '../../../common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { MinistryGroupHistoryModel } from './ministry-group-history.entity';
import { GroupRole } from '../../../management/groups/const/group-role.enum';

@Entity()
export class MinistryGroupRoleHistoryModel extends BaseModel {
  @Index()
  @Column()
  ministryGroupHistoryId: number;

  @ManyToOne(() => MinistryGroupHistoryModel)
  @JoinColumn({ name: 'ministryGroupHistoryId' })
  ministryGroupHistory: MinistryGroupHistoryModel;

  @Column({ default: GroupRole })
  role: GroupRole;

  @Index()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;
}
