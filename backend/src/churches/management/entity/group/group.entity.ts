import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { ChurchModel } from '../../../entity/church.entity';
import { GroupRoleModel } from './group-role.entity';
import { GroupHistoryModel } from '../../../members-settings/entity/group-history.entity';
import { BaseModel } from '../../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';

@Entity()
export class GroupModel extends BaseModel {
  @Column()
  name: string;

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

  @OneToMany(() => MemberModel, (member) => member.groupHistory)
  members: MemberModel[];

  @OneToMany(() => GroupRoleModel, (groupRole) => groupRole.group)
  groupRoles: GroupRoleModel[];

  @OneToMany(() => GroupHistoryModel, (history) => history.group)
  history: GroupHistoryModel[];
}
