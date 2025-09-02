import { PaymentMethodModel } from '../entity/payment-method.entity';

export class PaymentMethodDto {
  public readonly priority: number;
  public readonly cardNo: string;
  public readonly cardName: string;
  constructor(paymentMethod: PaymentMethodModel) {
    this.priority = paymentMethod.priority;
    this.cardName = paymentMethod.cardName;
    this.cardNo = paymentMethod.cardNo;
  }
}
