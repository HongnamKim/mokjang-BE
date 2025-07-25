import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { GroupDetailHistoryModel } from './group-detail-history.entity';

@Entity()
export class GroupHistoryModel extends BaseModel {
  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.groupHistory)
  member: MemberModel;

  @Index()
  @Column({
    type: 'int',
    comment: '현재 그룹 ID (현재 그룹일 경우에만 값이 있음)',
    nullable: true,
  })
  groupId: number | null;

  @ManyToOne(() => GroupModel, (group) => group.history)
  @JoinColumn({ name: 'groupId' })
  group: GroupModel | null;

  @Column({
    comment: '그룹 종료일 시점의 그룹, 그룹 위계는 __ 로 구분',
    nullable: true,
  })
  groupSnapShot: string;

  @Index()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;

  @Column({ default: false })
  hasDetailHistory: boolean;

  @OneToMany(
    () => GroupDetailHistoryModel,
    (detailHistory) => detailHistory.groupHistory,
  )
  groupDetailHistory: GroupDetailHistoryModel[];
}
