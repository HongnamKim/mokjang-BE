import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  mixin,
  Type,
} from '@nestjs/common';
import { DomainType } from '../const/domain-type.enum';
import { DomainAction } from '../const/domain-action.enum';
import { CustomRequest } from '../../common/custom-request';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';

export function createDomainGuard(
  domainType: DomainType,
  domainNameForMessage: string,
  domainAction: DomainAction,
): Type<CanActivate> {
  @Injectable()
  class GenericDomainGuard implements CanActivate {
    constructor() {}

    private checkPermission(
      domainType: DomainType,
      domainAction: DomainAction,
      requestManager: ChurchUserModel,
    ) {
      if (requestManager.role === ChurchUserRole.OWNER) return true;

      if (!requestManager.isPermissionActive) {
        return false;
      }

      const permissionTemplate = requestManager.permissionTemplate;
      if (!permissionTemplate) return false;

      for (const permissionUnit of permissionTemplate.permissionUnits) {
        if (
          permissionUnit.domain === domainType &&
          permissionUnit.action === domainAction
        ) {
          return true;
        }
      }

      return false;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req: CustomRequest = context.switchToHttp().getRequest();

      const token = req.tokenPayload;

      if (!token) {
        throw new InternalServerErrorException('JWT 처리 과정 누락');
      }

      const church = req.church;
      const requestManager = req.requestManager;

      if (!church || !requestManager) {
        throw new InternalServerErrorException('관리자 검증 누락');
      }

      const hasPermission = this.checkPermission(
        domainType,
        domainAction,
        requestManager,
      );

      if (!hasPermission) {
        const actionText = domainAction === DomainAction.READ ? '읽기' : '쓰기';

        throw new ForbiddenException(
          `${domainNameForMessage} 기능에 대한 ${actionText} 권한이 없습니다.`,
        );
      }

      return true;
    }
  }

  return mixin(GenericDomainGuard);
}
