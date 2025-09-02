import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncData } from '../../payment-method/dto/enc-data.dto';
import { RegisterBillKeyResponseDto } from '../../payment-method/dto/external/register-bill-key-response.dto';
import { ExpireBillKeyResponseDto } from '../../payment-method/dto/external/expire-bill-key-response.dto';
import { PaymentMethodModel } from '../../payment-method/entity/payment-method.entity';
import { SubscriptionModel } from '../entity/subscription.entity';

@Injectable()
export class PgService {
  constructor(private readonly configService: ConfigService) {}

  async registerBillKey(encData: EncData, isTest: boolean) {
    const plainText = Object.entries(encData)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    if (isTest) {
      return new RegisterBillKeyResponseDto();
    }

    throw new InternalServerErrorException('아직 PG API 연결 안함');
  }

  async expireBillKey(billKey: string) {
    return new ExpireBillKeyResponseDto();
  }

  async pay(paymentMethod: PaymentMethodModel, plan: SubscriptionModel) {
    const dto = {
      orderId: Date.now(),
      amount: plan.amount,
      goodsName: plan.currentPlan,
      cardQuota: 0,
      useShopInterest: false,
    };

    // 결제 후 resultCode 가 0000 이 아니라면 BadGate

    return {
      paidAt: new Date(),
      amount: plan.amount,
      goodsName: plan.currentPlan,
    };
  }
}
