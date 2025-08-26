import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionModel } from '../entity/subscription.entity';
import { ISUBSCRIPTION_DOMAIN_SERVICE } from './interface/subscription-domain.service.interface';
import { SubscriptionDomainService } from './service/subscription-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionModel])],
  providers: [
    {
      provide: ISUBSCRIPTION_DOMAIN_SERVICE,
      useClass: SubscriptionDomainService,
    },
  ],
  exports: [ISUBSCRIPTION_DOMAIN_SERVICE],
})
export class SubscriptionDomainModule {}
