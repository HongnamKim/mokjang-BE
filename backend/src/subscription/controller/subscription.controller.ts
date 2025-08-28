import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SubscriptionService } from '../service/subscription.service';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { SubscribePlanDto } from '../dto/request/subscribe-plan.dto';
import { UserGuard } from '../../user/guard/user.guard';
import { User } from '../../user/decorator/user.decorator';
import { UserModel } from '../../user/entity/user.entity';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiOperation({ summary: '정기 결제 중인 구독 조회' })
  @Get('current')
  @UseGuards(AccessTokenGuard, UserGuard)
  getSubscription(@User() user: UserModel) {
    return this.subscriptionService.getCurrentSubscription(user);
  }

  @ApiOperation({ summary: '무료 체험 신청' })
  @Post('trial')
  @UseGuards(AccessTokenGuard, UserGuard)
  @UseInterceptors(TransactionInterceptor)
  startFreeTrial(@User() user: UserModel, @QueryRunner() qr: QR) {
    return this.subscriptionService.startFreeTrial(user, qr);
  }

  @ApiOperation({ summary: '구독 신청' })
  @Post('subscribe')
  @UseGuards(AccessTokenGuard, UserGuard)
  subscribePlan(@User() user: UserModel, @Body() dto: SubscribePlanDto) {
    return this.subscriptionService.subscribePlan(user, dto);
  }

  @ApiOperation({ summary: '구독 플랜 업그레이드' })
  @Patch('upgrade')
  @UseGuards(AccessTokenGuard, UserGuard)
  upgradePlan(@User() user: UserModel) {}

  @ApiOperation({ summary: '구독 플랜 다운그레이드' })
  @Patch('downgrade')
  @UseGuards(AccessTokenGuard, UserGuard)
  downgradePlan(@User() user: UserModel) {}

  @ApiOperation({ summary: '구독 플랜 취소' })
  @Delete('cancel')
  @UseGuards(AccessTokenGuard, UserGuard)
  cancelPlan(@User() user: UserModel) {}

  @ApiOperation({ summary: '구독 즉시 만료' })
  @Delete('expire')
  @UseGuards(AccessTokenGuard, UserGuard)
  expirePlan(@User() user: UserModel) {}

  @ApiOperation({ summary: '만료된 무료 체험 데이터 삭제' })
  @Delete('cleanup/manual/expired-trials')
  @UseInterceptors(TransactionInterceptor)
  cleanupExpiredTrials(@QueryRunner() qr: QR) {
    return this.subscriptionService.cleanupExpiredTrialsManual(qr);
  }
}
