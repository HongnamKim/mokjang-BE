import { SubscriptionModel } from '../../entity/subscription.entity';
import { UserModel } from '../../../user/entity/user.entity';
import { QueryRunner } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';

export const ITEST_SUBSCRIPTION_DOMAIN_SERVICE = Symbol(
  'ITEST_SUBSCRIPTION_DOMAIN_SERVICE',
);

export interface ITestSubscriptionDomainService {
  initTestPlan(
    church: ChurchModel,
    owner: UserModel,
    qr: QueryRunner,
  ): Promise<SubscriptionModel>;
}
