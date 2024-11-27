import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BelieverModel } from '../believers/entity/believer.entity';
import { ChurchModel } from './church.entity';

@Entity()
export class PositionModel extends BaseModel {
  @Column()
  name: string;

  @Column()
  @Index()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.positions)
  church: ChurchModel;

  @OneToMany(() => BelieverModel, (believer) => believer.position)
  believers: BelieverModel[];
}
