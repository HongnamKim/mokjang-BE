import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { GroupRoleModel } from './group-role.entity';
import { BaseModel } from '../../../common/entity/base.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GroupHistoryModel } from '../../../member-history/entity/group-history.entity';

@Entity()
//@Unique(['name', 'parentGroupId', 'churchId'])
export class GroupModel extends BaseModel {
  @Column()
  name: string;

  @Column({ default: 1 })
  order: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  parentGroupId: number | null;

  @ManyToOne(() => GroupModel, (group) => group.childGroups)
  parentGroup: GroupModel;

  @Column('int', { array: true, default: [] })
  childGroupIds: number[];

  @OneToMany(() => GroupModel, (group) => group.parentGroup)
  childGroups: GroupModel[];

  @Column()
  @Index()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.groups)
  church: ChurchModel;

  @Column({ default: 0 })
  membersCount: number;

  @OneToMany(() => MemberModel, (member) => member.group)
  members: MemberModel[];

  @OneToMany(() => GroupRoleModel, (groupRole) => groupRole.group)
  groupRoles: GroupRoleModel[];

  @OneToMany(() => GroupHistoryModel, (history) => history.group)
  history: GroupHistoryModel[];
}
