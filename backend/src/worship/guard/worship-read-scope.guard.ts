import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { PermissionScopeModel } from '../../permission/entity/permission-scope.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';
import { PermissionScopeException } from '../../permission/exception/permission-scope.exception';
import { WorshipModel } from '../entity/worship.entity';
import { Request } from 'express';

export interface CustomRequest extends Request {
  church: ChurchModel;
  worship: WorshipModel;
  requestManager: ChurchUserModel;
  permissionScopeGroupIds: number[];
  tokenPayload: any;
}

@Injectable()
export class WorshipReadScopeGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  private async getRequestChurch(req: CustomRequest) {
    const churchId = parseInt(req.params.churchId);

    return req.church
      ? req.church
      : await this.churchesDomainService.findChurchModelById(churchId);
  }

  private async getRequestManager(
    req: CustomRequest,
    church: ChurchModel,
  ): Promise<ChurchUserModel> {
    const token = req.tokenPayload;

    if (!token) {
      throw new InternalServerErrorException('토큰 처리 과정 누락');
    }

    const requestUserId = token.id;

    return req.requestManager
      ? req.requestManager
      : this.managerDomainService.findManagerForPermissionCheck(
          church,
          requestUserId,
        );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    const church = await this.getRequestChurch(req);

    const requestManager = await this.getRequestManager(req, church);

    // 소유자
    if (requestManager.role === ChurchUserRole.OWNER) {
      return true;
    }

    // 전체 권한 범위
    if (requestManager.permissionScopes.some((scope) => scope.isAllGroups)) {
      return true;
    }

    const rootPermissionScopeGroupIds = requestManager.permissionScopes.map(
      (permissionScope: PermissionScopeModel) => permissionScope.group.id,
    );

    const permissionGroupIds = (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        rootPermissionScopeGroupIds,
      )
    ).map((group) => group.id);

    req.permissionScopeGroupIds = permissionGroupIds;

    const requestGroupId = this.parseGroupId(req);

    if (requestGroupId === undefined) {
      return true;
    }

    if (!permissionGroupIds.includes(requestGroupId)) {
      throw new ForbiddenException(PermissionScopeException.OUT_OF_SCOPE_GROUP);
    }

    return true;
  }

  private parseGroupId(req: Request) {
    const requestGroupId = req.query.groupId;
    if (!requestGroupId) {
      return undefined;
    }

    if (typeof requestGroupId === 'string') {
      return parseInt(requestGroupId, 10);
    }

    throw new InternalServerErrorException('알 수 없는 에러 발생');
  }
}
