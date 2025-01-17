import { Column, Entity, Index, ManyToMany, ManyToOne } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { ChurchModel } from '../../../entity/church.entity';
import { MinistryGroupModel } from './ministry-group.entity';
import { BaseModel } from '../../../../common/entity/base.entity';

@Entity()
export class MinistryModel extends BaseModel {
  @Column({ length: 50, comment: '사역명' })
  name: string;

  @Column({ default: 0 })
  membersCount: number;

  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.ministries)
  church: ChurchModel;

  @Column({ nullable: true })
  @Index()
  ministryGroupId: number | null;

  @ManyToOne(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.ministries,
  )
  ministryGroup: MinistryGroupModel;

  @ManyToMany(() => MemberModel, (member) => member.ministries)
  members: MemberModel[];
}
