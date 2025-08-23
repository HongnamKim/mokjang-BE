import { Controller, Post, UseGuards } from '@nestjs/common';
import { SubscriptionService } from '../service/subscription.service';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { Token } from '../../auth/decorator/jwt.decorator';
import { AuthType } from '../../auth/const/enum/auth-type.enum';
import { JwtPayload } from '../../auth/type/jwt';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('trial')
  @UseGuards(AccessTokenGuard)
  startFreeTrial(@Token(AuthType.ACCESS) accessToken: JwtPayload) {
    return this.subscriptionService.startFreeTrial(accessToken.id);
  }

  @Post('subscribe')
  startSubscription(@Token(AuthType.ACCESS) accessToken: JwtPayload) {
    return accessToken;
  }
}
