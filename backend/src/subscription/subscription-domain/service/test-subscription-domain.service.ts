import { Injectable } from '@nestjs/common';
import { ITestSubscriptionDomainService } from '../interface/test-subscription-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionModel } from '../../entity/subscription.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserModel } from '../../../user/entity/user.entity';
import { SubscriptionPlan } from '../../const/subscription-plan.enum';
import { SubscriptionStatus } from '../../const/subscription-status.enum';
import { addDays, subHours } from 'date-fns';
import { BillingCycle } from '../../const/billing-cycle.enum';
import { ChurchModel } from '../../../churches/entity/church.entity';

@Injectable()
export class TestSubscriptionDomainService
  implements ITestSubscriptionDomainService
{
  constructor(
    @InjectRepository(SubscriptionModel)
    private readonly repository: Repository<SubscriptionModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(SubscriptionModel) : this.repository;
  }

  initTestPlan(
    church: ChurchModel,
    owner: UserModel,
    qr: QueryRunner,
  ): Promise<SubscriptionModel> {
    const repository = this.getRepository(qr);

    const now = new Date();
    const endDate = addDays(new Date(), 30);

    return repository.save({
      churchId: church.id,
      isCurrent: true,
      userId: owner.id,
      currentPlan: SubscriptionPlan.BASIC,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
      billingCycle: BillingCycle.MONTHLY,
      nextBillingDate: subHours(endDate, 2),
      amount: 49000,
      autoRenew: true,
      maxMembers: 100,
    });
  }
}
