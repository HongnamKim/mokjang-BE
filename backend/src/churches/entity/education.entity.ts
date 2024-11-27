import { BaseModel } from '../../common/entity/base.entity';
import { BelieverModel } from '../believers/entity/believer.entity';
import { Column, Entity, Index, ManyToMany, ManyToOne } from 'typeorm';
import { ChurchModel } from './church.entity';

@Entity()
export class EducationModel extends BaseModel {
  @Column()
  name: string;

  @Column()
  @Index()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.educations)
  church: ChurchModel;

  @ManyToMany(() => BelieverModel, (believer) => believer.educations)
  believers: BelieverModel[];
}
