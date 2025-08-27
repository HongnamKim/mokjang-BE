import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { UserModel } from '../../user/entity/user.entity';

@Entity()
@Unique(['userId', 'date'])
export class ChurchJoinStatModel extends BaseModel {
  @Index()
  @Column()
  userId: number;

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  user: UserModel;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({ default: 1 })
  attempts: number;
}
