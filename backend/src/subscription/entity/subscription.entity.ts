import { BaseModel } from '../../common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { UserModel } from '../../user/entity/user.entity';
import { SubscriptionPlan } from '../const/subscription-plan.enum';
import { SubscriptionStatus } from '../const/subscription-status.enum';
import { BillingCycle } from '../const/billing-cycle.enum';
import { ChurchModel } from '../../churches/entity/church.entity';

@Entity()
export class SubscriptionModel extends BaseModel {
  @OneToOne(() => ChurchModel, (church) => church.subscription)
  church: ChurchModel;

  @Column()
  @Index()
  userId: number;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @Column()
  currentPlan: SubscriptionPlan;

  @Column()
  status: SubscriptionStatus;

  @Column()
  currentPeriodStart: Date;

  @Column()
  currentPeriodEnd: Date;

  @Column({ nullable: true })
  billingCycle: BillingCycle;

  @Column({ nullable: true })
  nextBillingDate: Date;

  @Column({ nullable: true })
  amount: number;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ default: false })
  isFreeTrial: boolean;

  @Column({ nullable: true })
  trialEndsAt: Date;

  @Column()
  maxMembers: number;

  @Column({ nullable: true })
  paymentMethodId: string; // PG사 결제수단 ID

  @Column({ nullable: true })
  customerId: string; // PG사 고객 ID

  @Column({ nullable: true })
  canceledAt: Date;

  @Column({ nullable: true })
  cancellationReason: string;
}
