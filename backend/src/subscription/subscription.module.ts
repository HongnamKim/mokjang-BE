import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SubscriptionController } from './controller/subscription.controller';
import { SubscriptionService } from './service/subscription.service';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { SubscriptionDomainModule } from './subscription-domain/subscription-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';

@Module({
  imports: [
    RouterModule.register([{ path: 'subscribe', module: SubscriptionModule }]),
    UserDomainModule,
    ChurchesDomainModule,
    SubscriptionDomainModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
