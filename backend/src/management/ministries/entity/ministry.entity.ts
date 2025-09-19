import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { MinistryGroupModel } from './ministry-group.entity';
import {
  BaseModel,
  BaseModelColumns,
} from '../../../common/entity/base.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { MinistryHistoryModel } from '../../../member-history/ministry-history/entity/child/ministry-history.entity';

@Entity()
export class MinistryModel extends BaseModel {
  @Column({ length: 50, comment: '사역명' })
  name: string;

  @Column({ default: 0 })
  membersCount: number;

  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.ministries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column()
  @Index()
  ministryGroupId: number;

  @ManyToOne(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.ministries,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'ministryGroupId' })
  ministryGroup: MinistryGroupModel;

  @ManyToMany(() => MemberModel, (member) => member.ministries)
  members: MemberModel[];

  @OneToMany(
    () => MinistryHistoryModel,
    (ministryHistory) => ministryHistory.ministry,
  )
  ministryHistory: MinistryHistoryModel[];
}

export const MinistryModelColumns = {
  ...BaseModelColumns,
  name: 'name',
  membersCount: 'membersCount',
  churchId: 'churchId',
  church: 'church',
  ministryGroupId: 'ministryGroupId',
  ministryGroup: 'ministryGroup',
  members: 'members',
  ministryHistory: 'ministryHistory',
};
