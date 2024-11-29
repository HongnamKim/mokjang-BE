import { BelieverModel } from '../../believers/entity/believer.entity';
import { Entity, ManyToMany, ManyToOne } from 'typeorm';
import { ChurchModel } from '../../entity/church.entity';
import { BaseChurchSettingModel } from './base-church-setting.entity';

@Entity()
export class EducationModel extends BaseChurchSettingModel {
  @ManyToOne(() => ChurchModel, (church) => church.educations)
  church: ChurchModel;

  @ManyToMany(() => BelieverModel, (believer) => believer.educations)
  believers: BelieverModel[];
}
