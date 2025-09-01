import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { UserGuard } from '../../user/guard/user.guard';
import { User } from '../../user/decorator/user.decorator';
import { UserModel } from '../../user/entity/user.entity';
import { PaymentMethodService } from '../service/payment-method.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdatePaymentMethodDto } from '../dto/request/update-payment-method.dto';
import { CreatePaymentMethodDto } from '../dto/request/create-payment-method.dto';
import { UseTransaction } from '../../common/decorator/use-transaction.decorator';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@ApiTags('Payment Method')
@Controller()
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @ApiOperation({
    summary: '등록된 결제 수단 조회',
    description: '등록된 결제 수단을 조회합니다.',
  })
  @Get()
  @UseGuards(AccessTokenGuard, UserGuard)
  getPaymentMethod(@User() user: UserModel) {
    return this.paymentMethodService.getUserPaymentMethod(user);
  }

  @ApiOperation({
    summary: '결제 수단 등록',
    description: '결제 수단을 등록합니다. 최대 1개 가능',
  })
  @Post()
  @UseGuards(AccessTokenGuard, UserGuard)
  @UseTransaction()
  postPaymentMethod(
    @User() user: UserModel,
    @Body() dto: CreatePaymentMethodDto,
    @QueryRunner() qr: QR,
  ) {
    return this.paymentMethodService.postPaymentMethod(user, dto, qr);
  }

  @ApiOperation({
    summary: '결제 수단 변경',
    description:
      '기존 Bill Key 를 삭제하고 새로 발급 받아 구독 정보를 업데이트',
  })
  @Patch()
  @UseGuards(AccessTokenGuard, UserGuard)
  @UseTransaction()
  patchPaymentMethod(
    @User() user: UserModel,
    @Body() dto: UpdatePaymentMethodDto,
    @QueryRunner() qr: QR,
  ) {
    return this.paymentMethodService.patchPaymentMethod(user, dto, qr);
  }

  @ApiOperation({
    summary: '결제 수단 삭제',
    description: '등록된 결제 수단을 삭제합니다.',
  })
  @Delete()
  @UseGuards(AccessTokenGuard, UserGuard)
  @UseTransaction()
  deletePaymentMethod(@User() user: UserModel, @QueryRunner() qr: QR) {
    return this.paymentMethodService.deletePaymentMethod(user, qr);
  }
}
