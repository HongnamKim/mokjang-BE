import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
  ) {}

  async startFreeTrial(userId: number) {
    const user = await this.userDomainService.findUserModelById(userId);

    if (user.hasUsedFreeTrial) {
      throw new ForbiddenException('이미 무료체험 이력이 있습니다.');
    }

    return user;
  }
}
