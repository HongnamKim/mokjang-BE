import { Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { ChurchUserRole } from '../../user/const/user-role.enum';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';

@Injectable()
export class TaskPermissionService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
  ) {}

  async hasTaskPermission(
    churchId: number,
    requestUserId: number,
    domainAction: DomainAction,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const requestManager =
      await this.managerDomainService.findManagerForPermissionCheck(
        church,
        requestUserId,
      );

    if (requestManager.role === ChurchUserRole.OWNER) {
      return true;
    }

    const permissionTemplate = requestManager.permissionTemplate;

    for (const permissionUnit of permissionTemplate.permissionUnits) {
      if (
        permissionUnit.domain === DomainType.TASK &&
        permissionUnit.action === domainAction
      ) {
        return true;
      }
    }

    return false;
  }
}
