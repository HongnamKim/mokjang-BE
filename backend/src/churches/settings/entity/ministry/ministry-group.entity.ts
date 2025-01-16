import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ChurchModel } from '../../../entity/church.entity';
import { MinistryModel } from './ministry.entity';
import { BaseModel } from '../../../../common/entity/base.entity';

@Entity()
export class MinistryGroupModel extends BaseModel {
  @Column({ length: 50, comment: '사역 그룹 이름' })
  name: string;

  @Column({ nullable: true })
  parentMinistryGroupId: number;

  @ManyToOne(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.childMinistryGroups,
  )
  parentMinistryGroup: MinistryGroupModel;

  @Column('int', { array: true, default: [], comment: '하위 그룹 ID 배열' })
  childMinistryGroupIds: number[];

  @OneToMany(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.parentMinistryGroup,
  )
  childMinistryGroups: MinistryGroupModel[];

  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.ministryGroups)
  church: ChurchModel;

  @OneToMany(() => MinistryModel, (ministry) => ministry.ministryGroup)
  ministries: MinistryModel[];
}
