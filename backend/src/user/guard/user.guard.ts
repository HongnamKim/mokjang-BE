import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../user-domain/interface/user-domain.service.interface';
import { CustomRequest } from '../../common/custom-request';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    const userId = req.tokenPayload.id;

    req.user = await this.userDomainService.findUserModelById(userId);

    return true;
  }
}
