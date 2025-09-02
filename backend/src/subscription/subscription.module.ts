import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SubscriptionController } from './controller/subscription.controller';
import { SubscriptionService } from './service/subscription.service';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { SubscriptionDomainModule } from './subscription-domain/subscription-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { PaymentMethodDomainModule } from '../payment-method/payment-method-domain/payment-method-domain.module';
import { SubscriptionCronService } from './service/subscription-cron.service';

@Module({
  imports: [
    RouterModule.register([{ path: 'subscribe', module: SubscriptionModule }]),
    UserDomainModule,
    ChurchesDomainModule,
    SubscriptionDomainModule,
    PaymentMethodDomainModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionCronService,
    //PgService,
    //TestSubscriptionService,
  ],
})
export class SubscriptionModule {}
