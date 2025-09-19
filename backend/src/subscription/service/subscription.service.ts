import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  ISUBSCRIPTION_DOMAIN_SERVICE,
  ISubscriptionDomainService,
} from '../subscription-domain/interface/subscription-domain.service.interface';
import { QueryRunner } from 'typeorm';
import { UserRole } from '../../user/const/user-role.enum';
import { UserModel } from '../../user/entity/user.entity';
import { SubscribePlanDto } from '../dto/request/subscribe-plan.dto';
import { PostSubscribePlanResponseDto } from '../dto/response/post-subscribe-plan-response.dto';
import { OrderException } from '../../order/exception/order.exception';
import { SubscriptionStatus } from '../const/subscription-status.enum';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IPAYMENT_METHOD_DOMAIN_SERVICE,
  IPaymentMethodDomainService,
} from '../../payment-method/payment-method-domain/interface/payment-method-domain.service.interface';
import {
  ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE,
  IChurchJoinRequestDomainService,
} from '../../church-join/church-join-domain/interface/church-join-requests-domain.service.interface';

@Injectable()
export class SubscriptionService {
  constructor(
    //private readonly pgService: PgService,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(ISUBSCRIPTION_DOMAIN_SERVICE)
    private readonly subscriptionDomainService: ISubscriptionDomainService,
    @Inject(IPAYMENT_METHOD_DOMAIN_SERVICE)
    private readonly paymentMethodDomainService: IPaymentMethodDomainService,
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,

    @Inject(ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE)
    private readonly churchJoinRequestDomainService: IChurchJoinRequestDomainService,
  ) {}

  async getCurrentSubscription(user: UserModel) {
    return this.subscriptionDomainService.findSubscriptionByUser(user);
  }

  async startFreeTrial(user: UserModel, qr: QueryRunner) {
    if (user.role !== UserRole.NONE) {
      throw new ForbiddenException(
        '교회에 가입된 사용자는 무료체험을 신청할 수 없습니다.',
      );
    }

    const isExistJoinRequest =
      await this.churchJoinRequestDomainService.isExistJoinRequest(user, qr);

    if (isExistJoinRequest) {
      throw new ConflictException('대기중인 교회 가입 신청 이력이 있습니다.');
    }

    if (user.hasUsedFreeTrial) {
      throw new ConflictException('현재 진행중인 구독이 있습니다.');
      //throw new ForbiddenException('이미 무료체험 이력이 있습니다.');
    }

    const trialSubscription =
      await this.subscriptionDomainService.createFreeTrial(user, qr);

    await this.userDomainService.startFreeTrial(user, qr);

    return trialSubscription;
  }

  async subscribePlan(user: UserModel, dto: SubscribePlanDto, qr: QueryRunner) {
    const paymentMethod =
      await this.paymentMethodDomainService.findUserPaymentMethod(user, qr);

    const newPlan = await this.subscriptionDomainService.subscribePlan(
      user,
      dto,
      qr,
    );

    // 기존 교회가 있을 경우
    if (user.role === UserRole.OWNER) {
      const oldChurch =
        await this.churchesDomainService.findChurchModelByOwner(user);

      if (oldChurch.memberCount > newPlan.maxMembers) {
        throw new ConflictException(
          '기존 교회 인원 수가 새로운 구독 조건에 맞지 않습니다.',
        );
      }

      await this.churchesDomainService.updateSubscription(
        oldChurch,
        newPlan,
        qr,
      );

      await this.subscriptionDomainService.updateSubscriptionStatus(
        newPlan,
        SubscriptionStatus.ACTIVE,
        qr,
      );
    }

    // 구독 첫 결제 요청
    try {
      // await this.orderService.payment(newPlan, user, paymentDto...)
      //const paymentResult = await this.pgService.pay(paymentMethod, newPlan);
      // 결제 결과
      //console.log(paymentResult);
    } catch {
      throw new BadGatewayException(OrderException.FAIL_PAYMENT);
    }

    return new PostSubscribePlanResponseDto(newPlan);
  }

  async restoreSubscription(user: UserModel, qr: QueryRunner) {
    const canceledSubscription =
      await this.subscriptionDomainService.findSubscriptionModelByStatus(
        user,
        SubscriptionStatus.CANCELED,
        qr,
        { church: true },
      );

    const restoreStatus = canceledSubscription.church
      ? SubscriptionStatus.ACTIVE
      : SubscriptionStatus.PENDING;

    await this.subscriptionDomainService.restoreSubscription(
      canceledSubscription,
      restoreStatus,
      qr,
    );
  }

  async retryPurchase(user: UserModel, qr: QueryRunner) {
    const subscription =
      await this.subscriptionDomainService.findFailedSubscriptionModel(
        user,
        qr,
      );

    if (subscription.status === SubscriptionStatus.CANCELED) {
      throw new ConflictException(
        '취소 처리된 구독에 결재를 재시도할 수 없습니다. 복구 후에 다시 시도해주세요.',
      );
    }

    const paymentMethod =
      await this.paymentMethodDomainService.findUserPaymentMethod(user, qr);

    await this.subscriptionDomainService.updatePaymentSuccess(
      subscription,
      true,
      qr,
    );

    try {
      // 결제 시도 | 반환값: 결제 내역
      // const order = await this.orderService.payment(subscription, user, paymentDto ...)
      //const paymentResult = await this.pgService.pay(paymentMethod,subscription,);

      return;
    } catch {
      throw new BadGatewayException(OrderException.FAIL_PAYMENT);
    }
  }

  async cancelSubscription(user: UserModel, qr: QueryRunner) {
    const subscription =
      await this.subscriptionDomainService.findSubscriptionByUser(user, qr);

    if (subscription.status === SubscriptionStatus.CANCELED) {
      return subscription;
    }

    const canceledDate = new Date();

    await this.subscriptionDomainService.cancelSubscription(
      subscription,
      canceledDate,
      qr,
    );

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = canceledDate;
    subscription.nextBillingDate = null;
    subscription.autoRenew = false;

    return subscription;
  }

  async expireSubscription(user: UserModel, qr: QueryRunner) {
    const canceledSubscription =
      await this.subscriptionDomainService.findSubscriptionModelByStatus(
        user,
        SubscriptionStatus.CANCELED,
        qr,
      );

    await this.subscriptionDomainService.expireSubscriptionForTest(
      canceledSubscription,
      qr,
    );

    return 'expired';
  }
}
