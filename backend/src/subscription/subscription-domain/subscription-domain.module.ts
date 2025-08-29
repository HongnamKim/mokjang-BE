import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionModel } from '../entity/subscription.entity';
import { ISUBSCRIPTION_DOMAIN_SERVICE } from './interface/subscription-domain.service.interface';
import { SubscriptionDomainService } from './service/subscription-domain.service';
import { ITEST_SUBSCRIPTION_DOMAIN_SERVICE } from './interface/test-subscription-domain.service.interface';
import { TestSubscriptionDomainService } from './service/test-subscription-domain.service';
import { IORDER_DOMAIN_SERVICE } from './interface/order-domain.service.interface';
import { OrderDomainService } from './service/order-domain.service';
import { OrderModel } from '../entity/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionModel, OrderModel])],
  providers: [
    {
      provide: ISUBSCRIPTION_DOMAIN_SERVICE,
      useClass: SubscriptionDomainService,
    },
    {
      provide: IORDER_DOMAIN_SERVICE,
      useClass: OrderDomainService,
    },
    {
      provide: ITEST_SUBSCRIPTION_DOMAIN_SERVICE,
      useClass: TestSubscriptionDomainService,
    },
  ],
  exports: [
    ISUBSCRIPTION_DOMAIN_SERVICE,
    IORDER_DOMAIN_SERVICE,
    ITEST_SUBSCRIPTION_DOMAIN_SERVICE,
  ],
})
export class SubscriptionDomainModule {}
