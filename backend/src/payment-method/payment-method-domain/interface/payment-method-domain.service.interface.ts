import { UserModel } from '../../../user/entity/user.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { PaymentMethodModel } from '../../entity/payment-method.entity';
import { RegisterBillKeyResponseDto } from '../../dto/external/register-bill-key-response.dto';

export const IPAYMENT_METHOD_DOMAIN_SERVICE = Symbol(
  'IPAYMENT_METHOD_DOMAIN_SERVICE',
);

export interface IPaymentMethodDomainService {
  findUserPaymentMethod(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<PaymentMethodModel>;

  createPaymentMethod(
    user: UserModel,
    cardNo: string,
    newBillKey: RegisterBillKeyResponseDto,
    qr: QueryRunner | undefined,
  ): Promise<PaymentMethodModel>;

  updatePaymentMethod(
    paymentMethod: PaymentMethodModel,
    cardNo: string,
    newBillKey: RegisterBillKeyResponseDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deletePaymentMethod(
    paymentMethod: PaymentMethodModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
