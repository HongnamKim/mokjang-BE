import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodModel } from '../entity/payment-method.entity';
import { IPAYMENT_METHOD_DOMAIN_SERVICE } from './interface/payment-method-domain.service.interface';
import { PaymentMethodDomainService } from './service/payment-method-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethodModel])],
  providers: [
    {
      provide: IPAYMENT_METHOD_DOMAIN_SERVICE,
      useClass: PaymentMethodDomainService,
    },
  ],
  exports: [IPAYMENT_METHOD_DOMAIN_SERVICE],
})
export class PaymentMethodDomainModule {}
