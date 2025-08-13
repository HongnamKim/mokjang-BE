import { ChildEntity, Column, Index, ManyToOne, OneToMany } from 'typeorm';
import { MinistryModel } from '../../../../management/ministries/entity/ministry.entity';
import { MinistryGroupDetailHistoryModel } from '../ministry-group-detail-history.entity';

@ChildEntity('ministry')
export class MinistryHistoryModel extends MinistryGroupDetailHistoryModel {
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

  @OneToMany(
    () => MinistryGroupDetailHistoryModel,
    (detail) => detail.ministryGroupHistory,
  )
  ministryGroupDetailHistory: MinistryGroupDetailHistoryModel[];
}
