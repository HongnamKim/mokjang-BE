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
import { addMonths, addYears, subHours, subMonths } from 'date-fns';
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

  private getSubscribeDates(billingCycle: BillingCycle) {
    const currentPeriodStart = new Date();
    const currentPeriodEnd =
      billingCycle === BillingCycle.MONTHLY
        ? addMonths(currentPeriodStart, 1)
        : addYears(currentPeriodStart, 1);
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

    const now = new Date();

    return repository.save({
      userId: user.id,
      isCurrent: true,
      currentPlan: SubscriptionPlan.FREE_TRIAL,
      status: SubscriptionStatus.PENDING,
      currentPeriodStart: now,
      currentPeriodEnd: addYears(now, 100),
      isFreeTrial: true,
      maxMembers: PlanMemberSize[SubscriptionPlan.FREE_TRIAL],
      paymentSuccess: true,
    });
  }

  async subscribePlan(
    user: UserModel,
    dto: SubscribePlanDto,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    // 보류 중 or 활성 상태 구독 정보가 있는지 체크
    const existSubscription = await repository.findOne({
      where: {
        userId: user.id,
        status: Not(SubscriptionStatus.EXPIRED),
      },
    });

    if (existSubscription) {
      if (existSubscription.status === SubscriptionStatus.CANCELED) {
        throw new ConflictException('최소 처리된 구독 정보 있음. 복구 필요');
      }

      throw new ConflictException(SubscriptionException.ALREADY_EXIST);
    }

    const { currentPeriodStart, currentPeriodEnd, nextBillingDate } =
      this.getSubscribeDates(dto.billingCycle);

    return repository.save({
      userId: user.id,
      isCurrent: true,
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
    });
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

  async updatePaymentSuccess(
    subscription: SubscriptionModel,
    value: boolean,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const newEndDate =
      subscription.billingCycle === BillingCycle.MONTHLY
        ? addMonths(subscription.currentPeriodEnd, 1)
        : addYears(subscription.currentPeriodEnd, 1);

    const result = await repository.update(
      {
        id: subscription.id,
      },
      {
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: newEndDate,
        nextBillingDate: subHours(newEndDate, 2),
        paymentSuccess: value,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        SubscriptionException.PAYMENT_SUCCESS_UPDATE_ERROR,
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

  async findFailedSubscriptionModel(
    user: UserModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SubscriptionModel>,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const failedSubscription = await repository.findOne({
      where: {
        userId: user.id,
        status: Not(SubscriptionStatus.EXPIRED),
        paymentSuccess: false,
      },
      relations: relationOptions,
    });

    if (!failedSubscription) {
      throw new NotFoundException(SubscriptionException.FAILED_NOT_FOUND);
    }

    return failedSubscription;
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
        paymentSuccess: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('교회 생성 가능한 구독 상태 없음');
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
        //trialEndsAt: MoreThanOrEqual(now),
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
    qr?: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

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
