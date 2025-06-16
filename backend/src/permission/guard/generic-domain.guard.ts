import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  mixin,
  Type,
} from '@nestjs/common';
import { DomainType } from '../const/domain-type.enum';
import { DomainAction } from '../const/domain-action.enum';
import {
  IDomainPermissionService,
  IDOMAIN_PERMISSION_SERVICE,
} from '../service/domain-permission.service.interface';

export function createDomainGuard(
  domainType: DomainType,
  domainNameForMessage: string,
  domainAction: DomainAction,
): Type<CanActivate> {
  @Injectable()
  class GenericDomainGuard implements CanActivate {
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

      const hasPermission = await this.permissionService.hasPermission(
        churchId,
        requestUserId,
        domainAction,
      );

      if (!hasPermission) {
        const actionText = domainAction === DomainAction.READ ? '읽기' : '쓰기';

        throw new ForbiddenException(
          `${domainNameForMessage} 기능에 대한 ${actionText} 권한이 없습니다.`,
        );
      }

      req.permissionedChurchUser = hasPermission;

      return true;
    }
  }

  return mixin(GenericDomainGuard);
}
