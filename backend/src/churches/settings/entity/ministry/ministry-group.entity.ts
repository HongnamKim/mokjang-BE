import { BaseChurchSettingModel } from '../base-church-setting.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ChurchModel } from '../../../entity/church.entity';
import { MinistryModel } from './ministry.entity';

@Entity()
export class MinistryGroupModel extends BaseChurchSettingModel {
  @Column({ nullable: true })
  parentMinistryGroupId: number;

  @ManyToOne(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.childMinistryGroups,
  )
  parentMinistryGroup: MinistryGroupModel;

  @Column('int', { array: true, default: [] })
  childMinistryGroupId: number[];

  @OneToMany(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.parentMinistryGroup,
  )
  childMinistryGroups: MinistryGroupModel[];

  @ManyToOne(() => ChurchModel, (church) => church.ministryGroups)
  church: ChurchModel;

  @OneToMany(() => MinistryModel, (ministry) => ministry.ministryGroup)
  ministries: MinistryModel[];
}
