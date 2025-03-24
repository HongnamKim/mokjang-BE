import { Column, Entity, Index, ManyToOne, OneToMany, Unique } from 'typeorm';
import { GroupModel } from './group.entity';
import { BaseModel } from '../../../common/entity/base.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../churches/members/entity/member.entity';
import { GroupHistoryModel } from '../../../churches/members-management/entity/group-history.entity';

@Entity()
@Unique(['role', 'groupId'])
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
