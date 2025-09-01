import {
  BadGatewayException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserModel } from '../../user/entity/user.entity';
import {
  IPAYMENT_METHOD_DOMAIN_SERVICE,
  IPaymentMethodDomainService,
} from '../payment-method-domain/interface/payment-method-domain.service.interface';
import { CreatePaymentMethodDto } from '../dto/request/create-payment-method.dto';
import { QueryRunner } from 'typeorm';
import { UpdatePaymentMethodDto } from '../dto/request/update-payment-method.dto';
import { PgService } from '../../subscription/service/pg.service';
import { GetPaymentMethodResponseDto } from '../dto/response/get-payment-method-response.dto';
import { PaymentMethodDto } from '../dto/payment-method.dto';
import { PostPaymentMethodResponseDto } from '../dto/response/post-payment-method-response.dto';
import { DeletePaymentMethodResponseDto } from '../dto/response/delete-payment-method-response.dto';
import { PaymentMethodException } from '../exception/payment-method.exception';

@Injectable()
export class PaymentMethodService {
  constructor(
    private readonly pgService: PgService,

    @Inject(IPAYMENT_METHOD_DOMAIN_SERVICE)
    private readonly paymentMethodDomainService: IPaymentMethodDomainService,
  ) {}

  async getUserPaymentMethod(user: UserModel) {
    const paymentMethod =
      await this.paymentMethodDomainService.findUserPaymentMethod(user);

    return new GetPaymentMethodResponseDto(new PaymentMethodDto(paymentMethod));
  }

  async postPaymentMethod(
    user: UserModel,
    dto: CreatePaymentMethodDto,
    qr: QueryRunner,
  ) {
    // 빌키 발급
    const newBillKey = await this.pgService.registerBillKey(dto, true);

    try {
      const newPaymentMethod =
        await this.paymentMethodDomainService.createPaymentMethod(
          user,
          dto.cardNo,
          newBillKey,
          qr,
        );

      return new PostPaymentMethodResponseDto(
        new PaymentMethodDto(newPaymentMethod),
      );
    } catch (error) {
      // 결제 수단 저장 실패 시 빌키 삭제
      await this.pgService.expireBillKey(newBillKey.bid);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('결제 수단 등록 에러 발생');
    }
  }

  async patchPaymentMethod(
    user: UserModel,
    dto: UpdatePaymentMethodDto,
    qr: QueryRunner,
  ) {
    const paymentMethod =
      await this.paymentMethodDomainService.findUserPaymentMethod(user, qr);

    const newBillKey = await this.pgService.registerBillKey(dto, true);

    try {
      await this.paymentMethodDomainService.updatePaymentMethod(
        paymentMethod,
        dto.cardNo,
        newBillKey,
        qr,
      );

      // 기존 빌키 삭제
      await this.pgService.expireBillKey(paymentMethod.bid);
    } catch {
      // 새로 생성된 빌키 삭제
      await this.pgService.expireBillKey(newBillKey.bid);

      throw new InternalServerErrorException(
        PaymentMethodException.UPDATE_ERROR,
      );
    }
  }

  async deletePaymentMethod(user: UserModel, qr: QueryRunner) {
    const paymentMethod =
      await this.paymentMethodDomainService.findUserPaymentMethod(user, qr);

    await this.paymentMethodDomainService.deletePaymentMethod(
      paymentMethod,
      qr,
    );

    try {
      // 빌키 삭제
      await this.pgService.expireBillKey(paymentMethod.bid);
    } catch {
      throw new BadGatewayException(PaymentMethodException.DELETE_ERROR);
    }

    return new DeletePaymentMethodResponseDto(
      new Date(),
      paymentMethod.id,
      true,
    );
  }
}
