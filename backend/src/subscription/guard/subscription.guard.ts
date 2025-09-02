import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import { CustomRequest } from '../../common/custom-request';
import { SubscriptionException } from '../exception/subscription.exception';
import { SubscriptionStatus } from '../const/subscription-status.enum';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
  ) {}

  private async getChurch(req: CustomRequest) {
    if (req.church) {
      return req.church;
    }
    const churchId = parseInt(req.params.churchId);

    return this.churchesDomainService.findChurchModelById(
      churchId,
      req.queryRunner,
      { subscription: true },
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    const church = await this.getChurch(req);

    const subscription = church.subscription;

    if (!subscription) {
      throw new ForbiddenException(
        SubscriptionException.FAIL_LOAD_SUBSCRIPTION,
      );
    }

    if (subscription.status === SubscriptionStatus.EXPIRED) {
      throw new ForbiddenException(SubscriptionException.EXPIRE_SUBSCRIPTION);
    }

    const now = new Date();

    if (subscription.currentPeriodEnd < now || !subscription.paymentSuccess) {
      throw new ForbiddenException(SubscriptionException.EXPIRE_SUBSCRIPTION);
    }

    /*if (church.isFreeTrial) {
      if (subscription.trialEndsAt < now) {
        throw new ForbiddenException(SubscriptionException.EXPIRE_FREE_TRIAL);
      }
    } else {

    }*/

    req.church = church;

    return true;
  }
}
