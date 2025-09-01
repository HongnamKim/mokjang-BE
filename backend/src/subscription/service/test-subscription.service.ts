import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  ITEST_SUBSCRIPTION_DOMAIN_SERVICE,
  ITestSubscriptionDomainService,
} from '../subscription-domain/interface/test-subscription-domain.service.interface';

@Injectable()
export class TestSubscriptionService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,

    @Inject(ITEST_SUBSCRIPTION_DOMAIN_SERVICE)
    private readonly testSubscriptionDomainService: ITestSubscriptionDomainService,
  ) {}

  async initTestPlan(qr: QueryRunner) {
    const churches = (
      await this.churchesDomainService.findAllChurches()
    ).filter((church) => church.ownerUserId && !church.subscription);

    for (const church of churches) {
      if (!church.ownerUserId) {
        continue;
      }

      const owner = await this.userDomainService.findUserModelById(
        church.ownerUserId,
      );

      const subscription =
        await this.testSubscriptionDomainService.initTestPlan(
          church,
          owner,
          qr,
        );

      await this.churchesDomainService.updateSubscription(
        church,
        subscription,
        qr,
      );
    }

    return churches;
  }
}
