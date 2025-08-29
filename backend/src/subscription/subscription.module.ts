import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SubscriptionController } from './controller/subscription.controller';
import { SubscriptionService } from './service/subscription.service';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { SubscriptionDomainModule } from './subscription-domain/subscription-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { TestSubscriptionService } from './service/test-subscription.service';
import { TestSubscriptionController } from './controller/test-subscription.controller';
import { PgService } from './service/pg.service';
import { SubscriptionCronService } from './service/subscription-cron.service';

@Module({
  imports: [
    RouterModule.register([{ path: 'subscribe', module: SubscriptionModule }]),
    UserDomainModule,
    ChurchesDomainModule,
    SubscriptionDomainModule,
  ],
  controllers: [TestSubscriptionController, SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionCronService,
    PgService,
    TestSubscriptionService,
  ],
})
export class SubscriptionModule {}
