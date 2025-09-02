import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModel } from '../entity/order.entity';
import { IORDER_DOMAIN_SERVICE } from './interface/order-domain.service.interface';
import { OrderDomainService } from './service/order-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderModel])],
  providers: [
    {
      provide: IORDER_DOMAIN_SERVICE,
      useClass: OrderDomainService,
    },
  ],
  exports: [IORDER_DOMAIN_SERVICE],
})
export class OrderDomainModule {}
