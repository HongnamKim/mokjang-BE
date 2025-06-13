import { DomainAction } from '../../permission/const/domain-action.enum';
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
import {
  IDomainPermissionService,
  IDOMAIN_PERMISSION_SERVICE,
} from '../../permission/service/domain-permission.service.interface';

export function VisitationGuard(domainAction: DomainAction): Type<CanActivate> {
  @Injectable()
  class VisitationPermissionGuard implements CanActivate {
    constructor(
      @Inject(IDOMAIN_PERMISSION_SERVICE)
      private readonly visitationPermissionService: IDomainPermissionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();

      const token = req.tokenPayload;

      if (!token) {
        throw new InternalServerErrorException('JWT 처리 과정 누락');
      }

      const churchId = parseInt(req.params.churchId);

      const requestUserId = token.id;

      const hasPermission =
        await this.visitationPermissionService.hasPermission(
          churchId,
          requestUserId,
          domainAction,
        );

      if (!hasPermission) {
        const actionText = domainAction === DomainAction.READ ? '읽기' : '쓰기';

        throw new ForbiddenException(
          `심방 기능에 대한 ${actionText} 권한이 없습니다.`,
        );
      }

      return !!hasPermission;
    }
  }

  return mixin(VisitationPermissionGuard);
}
