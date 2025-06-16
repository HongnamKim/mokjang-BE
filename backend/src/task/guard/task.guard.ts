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
import { DomainAction } from '../../permission/const/domain-action.enum';
import {
  IDomainPermissionService,
  IDOMAIN_PERMISSION_SERVICE,
} from '../../permission/service/domain-permission.service.interface';

export function TaskGuard(domainAction: DomainAction): Type<CanActivate> {
  @Injectable()
  class TaskPermissionGuard implements CanActivate {
    constructor(
      @Inject(IDOMAIN_PERMISSION_SERVICE)
      private readonly taskPermissionService: IDomainPermissionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();

      const token = req.tokenPayload;

      if (!token) {
        throw new InternalServerErrorException('JWT 처리 과정 누락');
      }

      const churchId = parseInt(req.params.churchId);

      const requestUserId = token.id;

      const hasPermission = await this.taskPermissionService.hasPermission(
        churchId,
        requestUserId,
        domainAction,
      );

      if (!hasPermission) {
        const actionText = domainAction === DomainAction.READ ? '읽기' : '쓰기';

        throw new ForbiddenException(
          `업무 기능에 대한 ${actionText} 권한이 없습니다.`,
        );
      }

      return !!hasPermission;
    }
  }
  return mixin(TaskPermissionGuard);
}
