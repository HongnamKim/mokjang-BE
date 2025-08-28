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
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { SubscriptionPlan } from '../../const/subscription-plan.enum';
import { SubscriptionStatus } from '../../const/subscription-status.enum';
import { addDays, addMonths, subHours } from 'date-fns';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { SubscriptionException } from '../../exception/subscription.exception';
import { SubscribePlanDto } from '../../dto/request/subscribe-plan.dto';
import { PlanAmount } from '../../const/plan-amount.enum';
import { PlanMemberSize } from '../../const/plan-member-size.enum';

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
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository();

    // 보류 중 or 활성 상태 구독 정보가 있는지 체크
    const existSubscription = await repository.findOne({
      where: {
        userId: user.id,
        status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING]),
      },
    });

    if (existSubscription) {
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
      amount: PlanAmount[dto.plan],
      autoRenew: true,
      isFreeTrial: false,
      maxMembers: PlanMemberSize[dto.plan],
      bid: billKey,
    });
  }

  async findSubscriptionByStatus(
    user: UserModel,
    status: SubscriptionStatus,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const subscription = await repository.findOne({
      where: {
        userId: user.id,
        status,
      },
    });

    if (!subscription) {
      throw new NotFoundException(SubscriptionException.NOT_FOUND);
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

  async findPendingSubscription(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const now = new Date();

    const subscription = await repository.findOne({
      where: {
        userId: user.id,
        status: SubscriptionStatus.PENDING,
        currentPeriodStart: LessThanOrEqual(now),
        currentPeriodEnd: MoreThanOrEqual(now),
      },
    });

    if (!subscription) {
      throw new NotFoundException('구독 정보를 찾을 수 없습니다.');
    }

    return subscription;
  }

  async findActivatedSubscription(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const subscription = await repository.findOne({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('활성화된 구독 정보를 찾을 수 없습니다.');
    }

    return subscription;
  }

  async activateSubscription(
    subscription: SubscriptionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: subscription.id,
      },
      {
        status: SubscriptionStatus.ACTIVE,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException('구독 정보 업데이트 실패');
    }

    return result;
  }

  async deactivateSubscription(
    subscription: SubscriptionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: subscription.id,
      },
      {
        status: SubscriptionStatus.PENDING,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException('구독 정보 업데이트 실패');
    }

    return result;
  }

  async findCurrentSubscription(
    church: ChurchModel,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository();

    const subscription = await repository.findOne({
      where: {
        church: {
          id: church.id,
        },
        isCurrent: true,
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

  async expireTrialSubscriptions(
    expiredTrials: SubscriptionModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      { id: In(expiredTrials.map((t) => t.id)) },
      {
        status: SubscriptionStatus.FAILED,
      },
    );

    if (result.affected !== expiredTrials.length) {
      throw new InternalServerErrorException(
        SubscriptionException.EXPIRE_SUBSCRIPTION_ERROR,
      );
    }

    return result;
  }

  async findCurrentUserSubscription(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const subscription = await repository.findOne({
      where: {
        userId: user.id,
        status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING]),
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
      throw new NotFoundException();
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
