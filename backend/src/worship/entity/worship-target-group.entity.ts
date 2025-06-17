import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { GroupModel } from '../../management/groups/entity/group.entity';
import { WorshipModel } from './worship.entity';

@Entity()
export class WorshipTargetGroupModel extends BaseModel {
  @Index()
  @Column()
  worshipId: number;

  @ManyToOne(() => WorshipModel)
  @JoinColumn({ name: 'worshipId' })
  worship: WorshipModel;

  @Index()
  @Column()
  groupId: number;

  @ManyToOne(() => GroupModel)
  @JoinColumn({ name: 'groupId' })
  group: GroupModel;
}
