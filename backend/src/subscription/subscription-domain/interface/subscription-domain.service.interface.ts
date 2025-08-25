import { UserModel } from '../../../user/entity/user.entity';
import { SubscriptionModel } from '../../entity/subscription.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';

export const ISUBSCRIPTION_DOMAIN_SERVICE = Symbol(
  'ISUBSCRIPTION_DOMAIN_SERVICE',
);

export interface ISubscriptionDomainService {
  createFreeTrial(user: UserModel, qr: QueryRunner): Promise<SubscriptionModel>;

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
}
