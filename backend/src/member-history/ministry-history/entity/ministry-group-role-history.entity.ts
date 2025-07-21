import { BaseModel } from '../../../common/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MinistryGroupHistoryModel } from './ministry-group-history.entity';
import { GroupRole } from '../../../management/groups/const/group-role.enum';

@Entity()
export class MinistryGroupRoleHistoryModel extends BaseModel {
  @ManyToOne(() => MinistryGroupHistoryModel)
  ministryGroupHistory: MinistryGroupHistoryModel;

  @Column({ default: GroupRole })
  role: GroupRole;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;
}
