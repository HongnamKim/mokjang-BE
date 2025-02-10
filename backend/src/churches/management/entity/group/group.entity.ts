import {
  BeforeRemove,
  BeforeSoftRemove,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { ChurchModel } from '../../../entity/church.entity';
import { GroupRoleModel } from './group-role.entity';
import { GroupHistoryModel } from '../../../members-management/entity/group-history.entity';
import { BaseModel } from '../../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { ConflictException } from '@nestjs/common';

@Entity()
@Unique(['name', 'parentGroupId', 'churchId'])
export class GroupModel extends BaseModel {
  @Column()
  name: string;

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

  @BeforeRemove()
  @BeforeSoftRemove()
  preventIfHasChildGroup() {
    if (this.childGroupIds.length > 0 || this.membersCount > 0) {
      throw new ConflictException(
        '해당 그룹에 속한 하위 그룹 또는 교인이 존재합니다.',
      );
    }
  }
}
