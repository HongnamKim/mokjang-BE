import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { OfficerHistoryModel } from '../../../member-history/officer-history/entity/officer-history.entity';

@Entity()
export class OfficerModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.officers)
  church: ChurchModel;

  @Index()
  @Column({ length: 30, nullable: true })
  name: string;

  @Column({ default: 1 })
  order: number;

  @Column({ default: 0 })
  membersCount: number;

  @OneToMany(() => MemberModel, (member) => member.officer)
  members: MemberModel[];

  @OneToMany(
    () => OfficerHistoryModel,
    (officerHistory) => officerHistory.officer,
  )
  history: OfficerHistoryModel[];
}
