import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { BelieverModel } from '../../believers/entity/believer.entity';
import { ChurchModel } from '../../entity/church.entity';
import { BaseChurchSettingModel } from './base-church-setting.entity';

@Entity()
export class MinistryModel extends BaseChurchSettingModel {
  @ManyToOne(() => ChurchModel, (church) => church.ministries)
  church: ChurchModel;

  @OneToMany(() => BelieverModel, (believer) => believer.ministry)
  believers: BelieverModel[];
}
