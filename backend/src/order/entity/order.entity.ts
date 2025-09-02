import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserModel } from '../../user/entity/user.entity';

@Entity()
export class OrderModel extends BaseModel {
  @Index()
  @Column()
  userId: number;

  @ManyToOne(() => UserModel, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @Column({ comment: '주문일' })
  orderedAt: Date;

  @Column({ comment: '주문 ID' })
  orderId: string;

  @Column({ comment: '상품명' })
  goodsName: string;

  @Column({ comment: '상품 가격' })
  amount: number;

  @Column({ comment: '성공 여부' })
  success: boolean;
}
