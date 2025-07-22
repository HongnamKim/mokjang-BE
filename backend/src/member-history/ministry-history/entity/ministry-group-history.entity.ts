import { BaseModel } from '../../../common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { MinistryGroupModel } from '../../../management/ministries/entity/ministry-group.entity';
import { MinistryHistoryModel } from './ministry-history.entity';
import { MinistryGroupRoleHistoryModel } from './ministry-group-role-history.entity';

@Entity()
export class MinistryGroupHistoryModel extends BaseModel {
  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel)
  @JoinColumn({ name: 'memberId' })
  member: MemberModel;

  @Index()
  @Column({ nullable: true })
  ministryGroupId: number | null;

  @ManyToOne(() => MinistryGroupModel)
  @JoinColumn({ name: 'ministryGroupId' })
  ministryGroup: MinistryGroupModel | null;

  @Index()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({
    type: 'varchar',
    comment: '사역그룹 종료일 시점의 사역 그룹, 그룹 위계는 __ 로 구분',
    nullable: true,
  })
  ministryGroupSnapShot: string | null;

  @OneToMany(
    () => MinistryHistoryModel,
    (ministryHistory) => ministryHistory.ministryGroupHistory,
  )
  ministryHistories: MinistryHistoryModel[];

  @OneToMany(
    () => MinistryGroupRoleHistoryModel,
    (ministryGroupRoleHistory) => ministryGroupRoleHistory.ministryGroupHistory,
  )
  ministryGroupRoleHistories: MinistryGroupRoleHistoryModel[];
}
