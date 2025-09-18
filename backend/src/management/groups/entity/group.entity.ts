import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GroupHistoryModel } from '../../../member-history/group-history/entity/group-history.entity';

@Entity()
export class GroupModel extends BaseModel {
  @Index()
  @Column()
  name: string;

  @Column({ default: 1 })
  order: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  parentGroupId: number | null;

  @ManyToOne(() => GroupModel, (group) => group.childGroups, {
    onDelete: 'CASCADE',
  })
  parentGroup: GroupModel;

  @Column('int', { array: true, default: [] })
  childGroupIds: number[];

  @OneToMany(() => GroupModel, (group) => group.parentGroup)
  childGroups: GroupModel[];

  @Column()
  @Index()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.groups, {
    onDelete: 'CASCADE',
  })
  church: ChurchModel;

  @Column({ default: 0 })
  membersCount: number;

  @Column({ type: 'int', nullable: true })
  leaderMemberId: number | null;

  @OneToOne(() => MemberModel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'leaderMemberId' })
  leaderMember: MemberModel | null;

  @OneToMany(() => MemberModel, (member) => member.group)
  members: MemberModel[];

  @OneToMany(() => GroupHistoryModel, (history) => history.group)
  history: GroupHistoryModel[];
}
