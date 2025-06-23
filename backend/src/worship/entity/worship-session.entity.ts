import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { WorshipModel } from './worship.entity';

@Entity()
export class WorshipSessionModel extends BaseModel {
  @Index()
  @Column()
  worshipId: number;

  @ManyToOne(() => WorshipModel)
  @JoinColumn({ name: 'worshipId' })
  worship: WorshipModel;

  @Column({ default: '' })
  description: string;

  @Index()
  @Column({ type: 'timestamptz' })
  sessionDate: Date;
}
