import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ChurchModel } from '../../entity/church.entity';
import { BaseChurchSettingModel } from './base-church-setting.entity';
import { GroupRoleModel } from './group-role.entity';
import { GroupHistoryModel } from '../../members-settings/entity/group-history.entity';

@Entity()
export class GroupModel extends BaseChurchSettingModel {
  /*
  @Index()
  @Column()
  churchId: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  membersCount: number;
   */

  @Column({ nullable: true })
  parentGroupId?: number;

  @ManyToOne(() => GroupModel, (group) => group.childGroups)
  parentGroup: GroupModel;

  @Column('int', { array: true, default: [] })
  childGroupIds: number[];

  @OneToMany(() => GroupModel, (group) => group.parentGroup)
  childGroups: GroupModel[];

  @ManyToOne(() => ChurchModel, (church) => church.groups)
  church: ChurchModel;

  /*@OneToMany(() => MemberModel, (member) => member.group)
  members: MemberModel[];*/

  @OneToMany(() => GroupRoleModel, (groupRole) => groupRole.group)
  roles: GroupRoleModel[];

  @OneToMany(() => GroupHistoryModel, (history) => history.group)
  history: GroupHistoryModel[];
}
