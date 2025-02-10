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
import { BaseModel } from '../../../../common/entity/base.entity';
import { GroupModel } from './group.entity';
import { ChurchModel } from '../../../entity/church.entity';
import { GroupHistoryModel } from '../../../members-management/entity/group-history.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { ConflictException } from '@nestjs/common';

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

  @BeforeRemove()
  @BeforeSoftRemove()
  async preventIfHasMembers() {
    if (this.members.length > 0) {
      const memberNames = this.members.map((m) => m.name).join(', ');
      throw new ConflictException(
        `해당 그룹 역할을 가진 교인이 존재합니다.\n(${memberNames})`,
      );
    }
  }
}
