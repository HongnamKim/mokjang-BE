import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { MinistryModel } from '../../../management/ministries/entity/ministry.entity';
import { MinistryGroupHistoryModel } from './ministry-group-history.entity';

@Entity()
export class MinistryHistoryModel extends BaseModel {
  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.ministryHistory)
  member: MemberModel;

  @Index()
  @Column({
    type: 'int',
    comment: '현재 사역 ID (현재 사역일 경우에만 값이 있음)',
    nullable: true,
  })
  ministryId: number | null;

  @ManyToOne(() => MinistryModel, (ministry) => ministry.ministryHistory)
  ministry: MinistryModel | null;

  @Column({ comment: '사역 종료일 시점의 사역 이름', nullable: true })
  ministrySnapShot: string;

  @Column()
  ministryGroupHistoryId: number;

  @ManyToOne(
    () => MinistryGroupHistoryModel,
    (ministryGroupHistory) => ministryGroupHistory.ministryHistories,
  )
  @JoinColumn({ name: 'ministryGroupHistoryId' })
  ministryGroupHistory: MinistryGroupHistoryModel;

  @Index()
  @Column({ type: 'timestamptz', comment: '사역 시작일' })
  startDate: Date;

  @Index()
  @Column({ type: 'timestamptz', comment: '사역 종료일', nullable: true })
  endDate: Date;
}
