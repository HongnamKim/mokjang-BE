import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ChurchModel } from '../../churches/entity/church.entity';

@Entity()
export class ChurchEventModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column()
  title: string;

  @Index()
  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({ default: '' })
  description: string;
}
