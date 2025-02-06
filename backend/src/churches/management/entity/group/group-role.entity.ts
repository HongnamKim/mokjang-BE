import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../../../../common/entity/base.entity';
import { GroupModel } from './group.entity';
import { ChurchModel } from '../../../entity/church.entity';
import { GroupHistoryModel } from '../../../members-management/entity/group-history.entity';
import { MemberModel } from '../../../members/entity/member.entity';

@Entity()
//@Unique(['role', 'groupId'])
export class GroupRoleModel extends BaseModel {
  @Column()
  role: string;

  @Index()
  @Column()
  groupId: number;

  @ManyToOne(() => GroupModel, (group) => group.groupRoles)
  group: GroupModel;

  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.groupRoles)
  church: ChurchModel;

  @OneToMany(() => MemberModel, (member) => member.groupRole)
  members: MemberModel[];

  @OneToMany(() => GroupHistoryModel, (groupHistory) => groupHistory.groupRole)
  history: GroupHistoryModel[];
}
