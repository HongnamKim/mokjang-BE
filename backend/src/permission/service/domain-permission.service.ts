import { IDomainPermissionService } from './domain-permission.service.interface';
import { DomainAction } from '../const/domain-action.enum';
import { DomainType } from '../const/domain-type.enum';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';
import { ChurchModel } from '../../churches/entity/church.entity';

export abstract class DomainPermissionService
  implements IDomainPermissionService
{
  abstract hasPermission(
    churchId: number,
    requestUserId: number,
    domainAction: DomainAction,
  ): Promise<{ requestManager: ChurchUserModel; church: ChurchModel } | null>;

  abstract getRequestManagerOrThrow(
    churchId: number,
    requestUserId: number,
  ): Promise<{ requestManager: ChurchUserModel; church: ChurchModel }>;

  protected checkPermission(
    domainType: DomainType,
    domainAction: DomainAction,
    requestManager: ChurchUserModel,
  ): boolean {
    if (requestManager.role === ChurchUserRole.OWNER) return true;

    if (!requestManager.isPermissionActive) {
      return false;
    }

    const permissionTemplate = requestManager.permissionTemplate;

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
}
