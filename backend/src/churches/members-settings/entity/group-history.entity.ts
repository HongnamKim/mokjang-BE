import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { GroupModel } from '../../settings/entity/group.entity';
import { MemberModel } from '../../members/entity/member.entity';

@Entity()
export class GroupHistoryModel extends BaseModel {
  @Index()
  @Column()
  groupId: number;

  @Column()
  groupName: string;

  @ManyToOne(() => GroupModel, (group) => group.history)
  group: GroupModel;

  @Column({ type: 'bigint', nullable: true })
  groupRoleId: number | null;

  @Column({ type: 'text', nullable: true })
  groupRoleName: string | null;

  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.groupHistory)
  member: MemberModel;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;
}
