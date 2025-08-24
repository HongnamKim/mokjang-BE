import { UserModel } from '../../../user/entity/user.entity';
import { SubscriptionModel } from '../../entity/subscription.entity';
import { QueryRunner, UpdateResult } from 'typeorm';

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
}
