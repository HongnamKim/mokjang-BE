import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IDOMAIN_PERMISSION_SERVICE,
  IDomainPermissionService,
} from '../service/domain-permission.service.interface';

@Injectable()
export class ChurchManagerGuard implements CanActivate {
  constructor(
    @Inject(IDOMAIN_PERMISSION_SERVICE)
    private readonly permissionService: IDomainPermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.tokenPayload;

    if (!token) {
      throw new InternalServerErrorException('JWT 처리 과정 누락');
    }

    const churchId = parseInt(req.params.churchId);
    const requestUserId = token.id;

    const requestManager =
      await this.permissionService.getRequestManagerOrThrow(
        churchId,
        requestUserId,
      );

    req.permissionedChurchUser = requestManager;

    return true;
  }
}
