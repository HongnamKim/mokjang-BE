import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';

@Entity()
export class OfficerHistoryModel extends BaseModel {
  @Index()
  @Column({ comment: '교인 ID' })
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.officerHistory, {
    onDelete: 'CASCADE',
  })
  member: MemberModel;

  @Index()
  @Column({
    type: 'int',
    comment: '현재 직분 ID (현재 직분일 경우에만 값이 있음)',
    nullable: true,
  })
  officerId: number | null;

  @ManyToOne(() => OfficerModel, (officer) => officer.history, {
    onDelete: 'SET NULL',
  })
  officer: OfficerModel | null;

  @Column({ comment: '직분 종료일 시점의 직분명', nullable: true })
  officerSnapShot: string;

  @Index()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;
}
