import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  ISUBSCRIPTION_DOMAIN_SERVICE,
  ISubscriptionDomainService,
} from '../subscription-domain/interface/subscription-domain.service.interface';
import { DataSource, QueryRunner } from 'typeorm';
import { UserRole } from '../../user/const/user-role.enum';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly dataSource: DataSource,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(ISUBSCRIPTION_DOMAIN_SERVICE)
    private readonly subscriptionDomainService: ISubscriptionDomainService,
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
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

  async cleanupExpiredTrialsManual(qr: QueryRunner) {
    const expiredTrials =
      await this.subscriptionDomainService.findExpiredTrials(qr);

    const expiredUserIds = expiredTrials.map((trial) => trial.userId);

    await this.userDomainService.expireTrials(expiredUserIds, qr);

    const expiredChurches = expiredTrials
      .filter((trial) => trial.church)
      .map((trial) => trial.church);

    await this.churchesDomainService.cleanupExpiredTrials(expiredChurches, qr);

    await this.subscriptionDomainService.expireTrialSubscriptions(
      expiredTrials,
      qr,
    );

    return { expiredCount: expiredTrials.length, timestamp: new Date() };
  }

  //@Cron('0 0 0 * * *')
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
