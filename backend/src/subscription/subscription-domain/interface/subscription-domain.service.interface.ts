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

  findSubscriptionModelByStatus(
    user: UserModel,
    status: SubscriptionStatus,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SubscriptionModel>,
  ): Promise<SubscriptionModel>;

  findAbleToCreateChurchSubscription(
    ownerUser: UserModel,
    qr: QueryRunner,
  ): Promise<SubscriptionModel>;

  findSubscriptionByChurch(church: ChurchModel): Promise<SubscriptionModel>;

  findSubscriptionByUser(
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
    qr?: QueryRunner,
  ): Promise<SubscriptionModel>;

  restoreSubscription(
    canceledSubscription: SubscriptionModel,
    restoreStatus: SubscriptionStatus,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateBillKey(
    subscription: SubscriptionModel,
    newBid: string,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateSubscriptionStatus(
    subscription: SubscriptionModel,
    status: SubscriptionStatus,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  cancelSubscription(
    subscription: SubscriptionModel,
    canceledDate: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  expireSubscriptionForTest(
    subscription: SubscriptionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  // ---------- 무료 체험 관련 ----------

  findTrialSubscription(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel>;

  findExpiredTrials(qr: QueryRunner): Promise<SubscriptionModel[]>;

  expireTrialSubscriptions(
    expiredTrials: SubscriptionModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
