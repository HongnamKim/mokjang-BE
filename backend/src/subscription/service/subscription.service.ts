import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(ISUBSCRIPTION_DOMAIN_SERVICE)
    private readonly subscriptionDomainService: ISubscriptionDomainService,
  ) {}

  async startFreeTrial(userId: number, qr: QueryRunner) {
    const user = await this.userDomainService.findUserModelById(userId);

    if (user.role !== UserRole.NONE) {
      throw new ForbiddenException(
        '교회에 가입된 사용자는 무료체험을 신청할 수 없습니다.',
      );
    }

    if (user.hasUsedFreeTrial) {
      throw new ForbiddenException('이미 무료체험 이력이 있습니다.');
    }

    const trialSubscription =
      await this.subscriptionDomainService.createFreeTrial(user, qr);

    await this.userDomainService.startFreeTrial(user, qr);

    return trialSubscription;
  }
}
