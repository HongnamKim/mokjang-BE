import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderDomainModule } from './order-domain/order-domain.module';

@Module({
  imports: [
    RouterModule.register([{ path: 'order', module: OrderModule }]),
    UserDomainModule,
    OrderDomainModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
