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
} from '../churches-domain/interface/churches-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import { ChurchAuthException } from '../const/exception/church.exception';

@Injectable()
export class ChurchMemberGuard implements CanActivate {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    const user = await this.userDomainService.findUserById(token.id);

    const churchId = parseInt(req.body.churchId);

    if (user.churchId !== churchId) {
      throw new ForbiddenException(ChurchAuthException.MEMBER_EXCEPTION);
    }

    return true;
  }
}

@Injectable()
export class ChurchManagerGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    const churchId = parseInt(req.params.churchId);

    const managerIds =
      await this.churchesDomainService.getChurchManagerIds(churchId);

    if (!managerIds.includes(token.id)) {
      throw new ForbiddenException(ChurchAuthException.MANAGER_EXCEPTION);
    }

    return true;
  }
}

@Injectable()
export class ChurchOwnerGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    const churchId = parseInt(req.params.churchId);

    const ownerIds =
      await this.churchesDomainService.getChurchOwnerIds(churchId);

    if (!ownerIds.includes(token.id)) {
      throw new ForbiddenException(ChurchAuthException.MAIN_ADMIN_EXCEPTION);
    }

    return true;
  }
}
