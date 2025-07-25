import { BaseModel } from '../../../common/entity/base.entity';
import { GroupHistoryModel } from './group-history.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { GroupRole } from '../../../management/groups/const/group-role.enum';
import { MemberModel } from '../../../members/entity/member.entity';

@Entity()
export class GroupDetailHistoryModel extends BaseModel {
  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel)
  @JoinColumn({ name: 'memberId' })
  member: MemberModel;

  @Index()
  @Column()
  groupHistoryId: number;

  @ManyToOne(() => GroupHistoryModel)
  @JoinColumn({ name: 'groupHistoryId' })
  groupHistory: GroupHistoryModel;

  @Column()
  role: GroupRole;

  @Index()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;
}
