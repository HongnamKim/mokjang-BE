import { UserModel } from '../../../user/entity/user.entity';
import { SubscriptionModel } from '../../entity/subscription.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { SubscribePlanDto } from '../../dto/request/subscribe-plan.dto';
import { SubscriptionStatus } from '../../const/subscription-status.enum';

export const ISUBSCRIPTION_DOMAIN_SERVICE = Symbol(
  'ISUBSCRIPTION_DOMAIN_SERVICE',
);

export interface ISubscriptionDomainService {
  createFreeTrial(user: UserModel, qr: QueryRunner): Promise<SubscriptionModel>;

  findSubscriptionByStatus(
    user: UserModel,
    status: SubscriptionStatus,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel>;

  findTrialSubscription(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel>;

  findPendingSubscription(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel>;

  activateSubscription(
    subscription: SubscriptionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findActivatedSubscription(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel>;

  deactivateSubscription(
    subscription: SubscriptionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findCurrentSubscription(church: ChurchModel): Promise<SubscriptionModel>;

  findExpiredTrials(qr: QueryRunner): Promise<SubscriptionModel[]>;

  expireTrialSubscriptions(
    expiredTrials: SubscriptionModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findCurrentUserSubscription(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel>;

  findSubscriptionModelById(
    user: UserModel,
    subscriptionId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SubscriptionModel>,
  ): Promise<SubscriptionModel>;

  subscribePlan(
    user: UserModel,
    dto: SubscribePlanDto,
    billKey: string,
  ): Promise<SubscriptionModel>;
}
