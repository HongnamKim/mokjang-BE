import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from '../service/subscription.service';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { SubscribePlanDto } from '../dto/request/subscribe-plan.dto';
import { UserGuard } from '../../user/guard/user.guard';
import { User } from '../../user/decorator/user.decorator';
import { UserModel } from '../../user/entity/user.entity';
import { SubscriptionCronService } from '../service/subscription-cron.service';
import { UseTransaction } from '../../common/decorator/use-transaction.decorator';

@Controller()
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionCronService: SubscriptionCronService,
  ) {}

  @ApiOperation({
    summary: '정기 결제 중인 구독 조회',
    description: '현재 구독 (EXPIRED 제외)',
  })
  @Get('current')
  @UseGuards(AccessTokenGuard, UserGuard)
  getSubscription(@User() user: UserModel) {
    return this.subscriptionService.getCurrentSubscription(user);
  }

  @ApiOperation({
    summary: '무료 체험 신청',
    description: '체험 이력이 없고, 교회에 가입되지 않은 계정만 가능',
  })
  @Post('trial')
  @UseGuards(AccessTokenGuard, UserGuard)
  @UseTransaction()
  startFreeTrial(@User() user: UserModel, @QueryRunner() qr: QR) {
    return this.subscriptionService.startFreeTrial(user, qr);
  }

  @ApiOperation({
    summary: '구독 신청',
    description:
      '<p>구독을 생성합니다.</p>' +
      '<p>CANCELED 일 때 새롭게 신청 불가능, 기존 구독을 복구만 가능 (플랜 변경도 불가능)</p>' +
      '<p>기존 소유한 교회가 있을 경우 해당 교회와 연결합니다.</p>',
  })
  @Post('subscribe')
  @UseTransaction()
  @UseGuards(AccessTokenGuard, UserGuard)
  subscribePlan(
    @User() user: UserModel,
    @Body() dto: SubscribePlanDto,
    @QueryRunner() qr: QR,
  ) {
    return this.subscriptionService.subscribePlan(user, dto, qr);
  }

  @ApiOperation({
    summary: '취소된 구독 복구',
    description: '취소된 구독을 복구합니다.',
  })
  @Post('restore')
  @UseTransaction()
  @UseGuards(AccessTokenGuard, UserGuard)
  restoreSubscription(@User() user: UserModel, @QueryRunner() qr: QR) {
    return this.subscriptionService.restoreSubscription(user, qr);
  }

  @ApiOperation({
    summary: '결제 수동 재시도',
    description: '현재 구독의 status 가 FAILED 일떄만 사용 가능합니다.',
  })
  @Post('retry')
  @UseTransaction()
  @UseGuards(AccessTokenGuard, UserGuard)
  retryPurchase(@User() user: UserModel, @QueryRunner() qr: QR) {
    return this.subscriptionService.retryPurchase(user, qr);
  }

  @ApiOperation({ summary: '구독 플랜 업그레이드 (미구현)' })
  @Patch('upgrade')
  @UseGuards(AccessTokenGuard, UserGuard)
  upgradePlan(@User() user: UserModel) {}

  @ApiOperation({ summary: '구독 플랜 다운그레이드 (미구현)' })
  @Patch('downgrade')
  @UseGuards(AccessTokenGuard, UserGuard)
  downgradePlan(@User() user: UserModel) {}

  @ApiOperation({
    summary: '구독 플랜 취소',
    description:
      '<p>구독 취소합니다. 남은 기간동안 ACTIVE 와 동일한 권리를 갖습니다.</p>',
  })
  @Delete('cancel')
  @UseTransaction()
  @UseGuards(AccessTokenGuard, UserGuard)
  cancelPlan(@User() user: UserModel, @QueryRunner() qr: QR) {
    return this.subscriptionService.cancelSubscription(user, qr);
  }

  @ApiOperation({
    summary: '구독 즉시 만료 (개발용)',
    description:
      '<p>취소된 구독의 만료 날짜를 현재로 수정 후 status 를 EXPIRED 로 변경합니다.</p>' +
      '<p>만료된 상황을 테스트하기 위한 엔드포인트입니다.</p>',
  })
  @Delete('expire')
  @UseTransaction()
  @UseGuards(AccessTokenGuard, UserGuard)
  expirePlan(@User() user: UserModel, @QueryRunner() qr: QR) {
    return this.subscriptionService.expireSubscription(user, qr);
  }

  @ApiOperation({ summary: '만료된 무료 체험 데이터 삭제' })
  @Delete('cleanup/manual/expired-trials')
  @UseTransaction()
  cleanupExpiredTrials(@QueryRunner() qr: QR) {
    return this.subscriptionCronService.cleanupExpiredTrialsManual(qr);
  }
}
