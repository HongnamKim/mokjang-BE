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
      throw new ForbiddenException('해당 교회의 교인만 접근할 수 있습니다.');
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
      throw new ForbiddenException('해당 교회의 관리자만 접근할 수 있습니다.');
    }

    return true;
  }
}

@Injectable()
export class ChurchMainAdminGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    const churchId = parseInt(req.params.churchId);

    const mainAdminIds =
      await this.churchesDomainService.getChurchMainAdminIds(churchId);

    if (!mainAdminIds.includes(token.id)) {
      throw new ForbiddenException(
        '해당 교회의 최고 관리자만 접근할 수 있습니다.',
      );
    }

    return true;
  }
}
