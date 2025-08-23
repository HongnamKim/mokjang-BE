import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SubscriptionController } from './controller/subscription.controller';
import { SubscriptionService } from './service/subscription.service';
import { UserDomainModule } from '../user/user-domain/user-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'subscription', module: SubscriptionModule },
    ]),
    UserDomainModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
