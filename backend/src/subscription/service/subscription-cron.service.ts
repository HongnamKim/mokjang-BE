import { Inject, Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { ChurchModel } from '../../churches/entity/church.entity';
import {
  ISUBSCRIPTION_DOMAIN_SERVICE,
  ISubscriptionDomainService,
} from '../subscription-domain/interface/subscription-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';

@Injectable()
export class SubscriptionCronService {
  constructor(
    private readonly dataSource: DataSource,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(ISUBSCRIPTION_DOMAIN_SERVICE)
    private readonly subscriptionDomainService: ISubscriptionDomainService,
  ) {}

  async cleanupExpiredTrialsManual(qr: QueryRunner) {
    const expiredTrials =
      await this.subscriptionDomainService.findExpiredTrials(qr);

    const expiredUserIds = expiredTrials
      .filter((trial) => trial.userId)
      .map((trial) => trial.userId) as number[];

    await this.userDomainService.expireTrials(expiredUserIds, qr);

    const expiredChurches = expiredTrials
      .filter((trial) => trial.church)
      .map((trial) => trial.church) as ChurchModel[];

    await this.churchesDomainService.cleanupExpiredTrials(expiredChurches, qr);

    await this.subscriptionDomainService.expireTrialSubscriptions(
      expiredTrials,
      qr,
    );

    return { expiredCount: expiredTrials.length, timestamp: new Date() };
  }

  //@Cron()
  async cleanupExpiredTrialsAuto() {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await this.cleanupExpiredTrialsManual(qr);

      await qr.commitTransaction();
    } catch {
      await qr.rollbackTransaction();
    } finally {
      await qr.release();
    }
  }
}
