import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { SubscriptionService } from '../service/subscription.service';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtPayload } from '../../auth/type/jwt';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('trial')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  startFreeTrial(
    @Token(AuthType.ACCESS) accessToken: JwtPayload,
    @QueryRunner() qr: QR,
  ) {
    return this.subscriptionService.startFreeTrial(accessToken.id, qr);
  }

  @Post('subscribe')
  startSubscription(@Token(AuthType.ACCESS) accessToken: JwtPayload) {
    return accessToken;
  }
}
