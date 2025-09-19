import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IPaymentMethodDomainService } from '../interface/payment-method-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethodModel } from '../../entity/payment-method.entity';
import { QueryRunner, Repository, UpdateResult } from 'typeorm';
import { UserModel } from '../../../user/entity/user.entity';
import { PaymentMethodException } from '../../exception/payment-method.exception';
import { RegisterBillKeyResponseDto } from '../../dto/external/register-bill-key-response.dto';

@Injectable()
export class PaymentMethodDomainService implements IPaymentMethodDomainService {
  constructor(
    @InjectRepository(PaymentMethodModel)
    private readonly repository: Repository<PaymentMethodModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(PaymentMethodModel) : this.repository;
  }

  async findUserPaymentMethod(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<PaymentMethodModel> {
    const repository = this.getRepository(qr);

    const paymentMethod = await repository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException(PaymentMethodException.NOT_FOUND);
    }

    return paymentMethod;
  }

  async createPaymentMethod(
    user: UserModel,
    cardNo: string,
    newBillKey: RegisterBillKeyResponseDto,
    qr: QueryRunner | undefined,
  ): Promise<PaymentMethodModel> {
    const repository = this.getRepository(qr);

    const isExist = await repository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (isExist) {
      throw new ConflictException(PaymentMethodException.ALREADY_EXIST);
    }

    return repository.save({
      userId: user.id,
      priority: 1,
      cardNo: cardNo.slice(12),
      cardName: newBillKey.cardName,
      bid: newBillKey.bid,
    });
  }

  async updatePaymentMethod(
    paymentMethod: PaymentMethodModel,
    cardNo: string,
    newBillKey: RegisterBillKeyResponseDto,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: paymentMethod.id,
      },
      {
        cardNo: cardNo.slice(12),
        cardName: newBillKey.cardName,
        bid: newBillKey.bid,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        PaymentMethodException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deletePaymentMethod(
    paymentMethod: PaymentMethodModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete({ id: paymentMethod.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        PaymentMethodException.DELETE_ERROR,
      );
    }

    return result;
  }
}
