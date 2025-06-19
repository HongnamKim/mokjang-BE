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

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({ type: 'timestamptz', nullable: true })
  sessionDate: Date;
}
