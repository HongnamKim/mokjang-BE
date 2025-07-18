import {
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { MinistryModel } from './ministry.entity';
import {
  BaseModel,
  BaseModelColumns,
} from '../../../common/entity/base.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';

@Entity()
export class MinistryGroupModel extends BaseModel {
  @Column({ length: 50, comment: '사역 그룹 이름' })
  name: string;

  @Column({ default: 1 })
  order: number;

  @Column({ nullable: true })
  @Index()
  parentMinistryGroupId: number | null;

  @ManyToOne(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.childMinistryGroups,
  )
  parentMinistryGroup: MinistryGroupModel;

  @Column('int', { array: true, default: [], comment: '하위 그룹 ID 배열' })
  childMinistryGroupIds: number[];

  @OneToMany(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.parentMinistryGroup,
  )
  childMinistryGroups: MinistryGroupModel[];

  @Column()
  @Index()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.ministryGroups)
  church: ChurchModel;

  @ManyToMany(() => MemberModel, (member) => member.ministryGroups)
  members: MemberModel[];

  @Column({ default: 0 })
  membersCount: number;

  @Column({ type: 'int', nullable: true })
  leaderMemberId: number | null;

  @OneToMany(() => MinistryModel, (ministry) => ministry.ministryGroup)
  ministries: MinistryModel[];
}

export const MinistryGroupModelColumns = {
  ...BaseModelColumns,
  name: 'name',
  parentMinistryGroupId: 'parentMinistryGroupId',
  parentMinistryGroup: 'parentMinistryGroup',
  childMinistryGroupIds: 'childMinistryGroupIds',
  childMinistryGroup: 'childMinistryGroup',
  churchId: 'churchId',
  church: 'church',
  ministries: 'ministries',
};
