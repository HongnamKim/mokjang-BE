import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { ChurchModel } from '../../../entity/church.entity';
import { BaseModel } from '../../../../common/entity/base.entity';
import { OfficerHistoryModel } from '../../../members-settings/entity/officer-history.entity';

@Entity()
export class OfficerModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.officers)
  church: ChurchModel;

  @Column({ length: 30, nullable: true })
  name: string;

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
