import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { UserModel } from '../../user/entity/user.entity';

@Entity()
export class PaymentMethodModel extends BaseModel {
  @Column()
  @Index()
  userId: number;

  @ManyToOne(() => UserModel, (user) => user.paymentMethods)
  user: UserModel;

  @Column({ default: 1 })
  priority: number;

  @Column({ comment: '카드 번호', nullable: true })
  cardNo: string;

  @Column({ comment: '카드사', nullable: true })
  cardName: string;

  @Column({ comment: '빌키', nullable: true })
  bid: string;
}
