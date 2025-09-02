import { Module } from '@nestjs/common';
import { PaymentMethodController } from './controller/payment-method.controller';
import { PaymentMethodService } from './service/payment-method.service';
import { RouterModule } from '@nestjs/core';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { PaymentMethodDomainModule } from './payment-method-domain/payment-method-domain.module';
import { PgService } from '../subscription/service/pg.service';

@Module({
  imports: [
    RouterModule.register([{ path: 'payment', module: PaymentMethodModule }]),
    UserDomainModule,
    PaymentMethodDomainModule,
  ],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService, PgService],
})
export class PaymentMethodModule {}
