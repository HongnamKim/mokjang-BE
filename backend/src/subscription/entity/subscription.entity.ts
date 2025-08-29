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
import { Exclude } from 'class-transformer';

@Entity()
export class SubscriptionModel extends BaseModel {
  @OneToOne(() => ChurchModel, (church) => church.subscription, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  church: ChurchModel | null;

  @Index()
  @Column({ nullable: true })
  userId: number | null;

  @ManyToOne(() => UserModel, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: UserModel | null;

  @Column({ default: true })
  isCurrent: boolean;

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

  @Column({ type: 'timestamptz', nullable: true })
  nextBillingDate: Date | null;

  @Column({ nullable: true })
  amount: number;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ default: false })
  isFreeTrial: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndsAt: Date;

  @Column()
  maxMembers: number;

  @Column({ type: 'varchar', comment: '정기 결제 빌키', nullable: true })
  @Exclude({ toPlainOnly: true })
  bid: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  canceledAt: Date;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  paymentMethodId: string; // PG사 결제수단 ID

  @Column({ nullable: true })
  customerId: string; // PG사 고객 ID
}
