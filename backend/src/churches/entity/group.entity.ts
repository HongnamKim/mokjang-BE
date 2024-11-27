import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { BelieverModel } from '../believers/entity/believer.entity';
import { ChurchModel } from './church.entity';

@Entity()
export class GroupModel extends BaseModel {
  @Column()
  name: string;

  @Column()
  @Index()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.groups)
  church: ChurchModel;

  @OneToMany(() => BelieverModel, (believer) => believer.group)
  believers: BelieverModel[];
}
