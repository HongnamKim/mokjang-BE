import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { MemberModel } from '../../members/entity/member.entity';
import { ChurchModel } from '../../entity/church.entity';
import { BaseChurchSettingModel } from './base-church-setting.entity';
import { GroupRoleModel } from './group-role.entity';

@Entity()
export class GroupModel extends BaseChurchSettingModel {
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

  @OneToMany(() => MemberModel, (member) => member.group)
  members: MemberModel[];

  @OneToMany(() => GroupRoleModel, (groupRole) => groupRole.group)
  roles: GroupRoleModel[];
}
