import {
  CanActivate,
  ExecutionContext,
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
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { PermissionScopeModel } from '../../permission/entity/permission-scope.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';

@Injectable()
export class WorshipReadScopeGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
  ) {}

  private async getRequestChurch(req) {
    const churchId = parseInt(req.params.churchId);

    return req.church
      ? req.church
      : await this.churchesDomainService.findChurchModelById(churchId);
  }

  private async getRequestManager(
    req: any,
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
    const req = context.switchToHttp().getRequest();

    const requestGroupId = parseInt(req.query.groupId);

    if (!requestGroupId) {
      return true;
    }

    const church = await this.getRequestChurch(req);

    const requestManager = await this.getRequestManager(req, church);

    if (requestManager.role === ChurchUserRole.OWNER) {
      return true;
    }

    const permissionScopeGroupIds = requestManager.permissionScopes.map(
      (permissionScope: PermissionScopeModel) => permissionScope.group.id,
    );

    const requestGroup = await this.groupsDomainService.findGroupModelById(
      church,
      requestGroupId,
    );

    const parentGroups = await this.groupsDomainService.findParentGroups(
      church,
      requestGroup,
    );

    const parentGroupIds = parentGroups.map((parentGroup) => parentGroup.id);
    parentGroupIds.push(requestGroup.id);

    for (const permissionScopeGroupId of permissionScopeGroupIds) {
      if (parentGroupIds.includes(permissionScopeGroupId)) {
        return true;
      }
    }

    return false;
  }
}
