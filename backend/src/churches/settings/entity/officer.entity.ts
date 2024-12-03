import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { BelieverModel } from '../../believers/entity/believer.entity';
import { ChurchModel } from '../../entity/church.entity';
import { BaseChurchSettingModel } from './base-church-setting.entity';

@Entity()
export class OfficerModel extends BaseChurchSettingModel {
  @ManyToOne(() => ChurchModel, (church) => church.positions)
  church: ChurchModel;

  @OneToMany(() => BelieverModel, (believer) => believer.officer)
  believers: BelieverModel[];
}
