import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ISubscriptionDomainService } from '../interface/subscription-domain.service.interface';
import { UserModel } from '../../../user/entity/user.entity';
import { SubscriptionModel } from '../../entity/subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { SubscriptionPlan } from '../../const/subscription-plan.enum';
import { SubscriptionStatus } from '../../const/subscription-status.enum';
import { addDays, addMonths, subHours, subMonths } from 'date-fns';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { SubscriptionException } from '../../exception/subscription.exception';
import { SubscribePlanDto } from '../../dto/request/subscribe-plan.dto';
import { PlanMemberSize } from '../../const/plan-member-size.enum';
import { BillingCycle } from '../../const/billing-cycle.enum';
import { PlanAmount } from '../../const/plan-amount.enum';

@Injectable()
export class SubscriptionDomainService implements ISubscriptionDomainService {
  constructor(
    @InjectRepository(SubscriptionModel)
    private readonly repository: Repository<SubscriptionModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(SubscriptionModel) : this.repository;
  }

  private getSubscribeDates() {
    const currentPeriodStart = new Date();
    const currentPeriodEnd = addMonths(currentPeriodStart, 1);
    const nextBillingDate = subHours(currentPeriodEnd, 2);

    return {
      currentPeriodStart,
      currentPeriodEnd,
      nextBillingDate,
    };
  }

  createFreeTrial(
    user: UserModel,
    qr: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    return repository.save({
      userId: user.id,
      currentPlan: SubscriptionPlan.FREE_TRIAL,
      status: SubscriptionStatus.PENDING,
      currentPeriodStart: new Date(),
      currentPeriodEnd: addDays(new Date(), 14),
      isFreeTrial: true,
      trialEndsAt: addDays(new Date(), 14),
      maxMembers: 50,
    });
  }

  async subscribePlan(
    user: UserModel,
    dto: SubscribePlanDto,
    billKey: string,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    // 보류 중 or 활성 상태 구독 정보가 있는지 체크
    const existSubscription = await repository.findOne({
      where: {
        userId: user.id,
        status: Not(SubscriptionStatus.EXPIRED) /*In([
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.PENDING,
          SubscriptionStatus.FAILED,
        ]),*/,
      },
    });

    if (existSubscription) {
      if (existSubscription.status === SubscriptionStatus.CANCELED) {
        throw new ConflictException('최소 처리된 구독 정보 있음. 복구 필요');
      }

      throw new ConflictException(SubscriptionException.ALREADY_EXIST);
    }

    const { currentPeriodStart, currentPeriodEnd, nextBillingDate } =
      this.getSubscribeDates();

    return repository.save({
      userId: user.id,
      currentPlan: dto.plan,
      status: SubscriptionStatus.PENDING,
      currentPeriodStart,
      currentPeriodEnd,
      billingCycle: dto.billingCycle,
      nextBillingDate,
      amount:
        dto.billingCycle === BillingCycle.MONTHLY
          ? PlanAmount[dto.plan]
          : PlanAmount[dto.plan] * 12 * 0.9,
      autoRenew: true,
      isFreeTrial: false,
      maxMembers: PlanMemberSize[dto.plan],
      bid: billKey,
    });
  }

  async updateBillKey(
    subscription: SubscriptionModel,
    newBid: string,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      { id: subscription.id },
      { bid: newBid },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        SubscriptionException.BILL_KEY_UPDATE_ERROR,
      );
    }

    return result;
  }

  async restoreSubscription(
    subscription: SubscriptionModel,
    restoreStatus: SubscriptionStatus,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: subscription.id,
      },
      {
        status: restoreStatus,
        canceledAt: null,
        autoRenew: true,
        nextBillingDate: subHours(subscription.currentPeriodEnd, 2),
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        SubscriptionException.FAIL_RESTORE_SUBSCRIPTION,
      );
    }

    return result;
  }

  async cancelSubscription(
    subscription: SubscriptionModel,
    canceledDate: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: subscription.id,
      },
      {
        status: SubscriptionStatus.CANCELED,
        canceledAt: canceledDate,
        nextBillingDate: null,
        autoRenew: false,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        SubscriptionException.FAIL_CANCEL_SUBSCRIPTION,
      );
    }

    return result;
  }

  async findSubscriptionModelByStatus(
    user: UserModel,
    status: SubscriptionStatus,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SubscriptionModel>,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const subscription = await repository.findOne({
      where: {
        userId: user.id,
        status,
      },
      relations: relationOptions,
    });

    if (!subscription) {
      throw new NotFoundException(SubscriptionException.NOT_FOUND(status));
    }

    return subscription;
  }

  async findAbleToCreateChurchSubscription(
    ownerUser: UserModel,
    qr: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const subscription = await repository.findOne({
      where: {
        userId: ownerUser.id,
        status: In([SubscriptionStatus.PENDING, SubscriptionStatus.CANCELED]),
      },
    });

    if (!subscription) {
      throw new NotFoundException();
    }

    return subscription;
  }

  async findTrialSubscription(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const now = new Date();

    const subscription = await repository.findOne({
      where: {
        userId: user.id,
        isFreeTrial: true,
        currentPeriodStart: LessThanOrEqual(now),
        currentPeriodEnd: MoreThanOrEqual(now),
        trialEndsAt: MoreThanOrEqual(now),
      },
    });

    if (!subscription) {
      throw new NotFoundException('구독 정보를 찾을 수 없습니다.');
    }

    return subscription;
  }

  async updateSubscriptionStatus(
    subscription: SubscriptionModel,
    status: SubscriptionStatus,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update({ id: subscription.id }, { status });

    if (result.affected === 0) {
      throw new InternalServerErrorException('구독 정보 업데이트 실패');
    }

    return result;
  }

  async findSubscriptionByChurch(
    church: ChurchModel,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository();

    const subscription = await repository.findOne({
      where: {
        church: {
          id: church.id,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('현재 구독 정보를 찾을 수 없습니다.');
    }

    return subscription;
  }

  findExpiredTrials(qr: QueryRunner): Promise<SubscriptionModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        isFreeTrial: true,
        trialEndsAt: LessThan(new Date()),
        status: SubscriptionStatus.ACTIVE,
      },
      relations: {
        church: true,
      },
      select: {
        church: {
          id: true,
        },
      },
    });
  }

  async expireSubscriptionForTest(
    subscription: SubscriptionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const now = new Date();

    const result = await repository.update(
      { id: subscription.id },
      {
        currentPeriodStart: subMonths(now, 1),
        currentPeriodEnd: now,

        bid: null,
        status: SubscriptionStatus.EXPIRED,
        isCurrent: false,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException('구독 강제 만료 실패');
    }

    return result;
  }

  async expireTrialSubscriptions(
    expiredTrials: SubscriptionModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      { id: In(expiredTrials.map((t) => t.id)) },
      {
        status: SubscriptionStatus.EXPIRED,
      },
    );

    if (result.affected !== expiredTrials.length) {
      throw new InternalServerErrorException(
        SubscriptionException.EXPIRE_SUBSCRIPTION_ERROR,
      );
    }

    return result;
  }

  async findSubscriptionByUser(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const subscription = await repository.findOne({
      where: {
        userId: user.id,
        status: Not(SubscriptionStatus.EXPIRED),
        isCurrent: true,
      },
      relations: {
        church: true,
      },
      select: {
        church: {
          id: true,
          name: true,
          memberCount: true,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(SubscriptionException.NOT_FOUND());
    }

    return subscription;
  }

  async findSubscriptionModelById(
    user: UserModel,
    subscriptionId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SubscriptionModel>,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const subscription = await repository.findOne({
      where: {
        userId: user.id,
        id: subscriptionId,
      },
      relations: relationOptions,
    });

    if (!subscription) {
      throw new NotFoundException();
    }

    return subscription;
  }
}
