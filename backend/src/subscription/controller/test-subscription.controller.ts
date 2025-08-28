import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { TestSubscriptionService } from '../service/test-subscription.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { ApiOperation } from '@nestjs/swagger';

@Controller('test-subscribe')
export class TestSubscriptionController {
  constructor(
    private readonly testSubscriptionService: TestSubscriptionService,
  ) {}

  @ApiOperation({
    summary: '기존 교회들의 구독 정보 초기 생성',
  })
  @Post('init')
  @UseInterceptors(TransactionInterceptor)
  startTestSubscribe(@QueryRunner() qr: QR) {
    return this.testSubscriptionService.initTestPlan(qr);
  }
}
