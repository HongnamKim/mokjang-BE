import { DomainAction } from '../const/domain-action.enum';

export const IDOMAIN_PERMISSION_SERVICE = Symbol('IDOMAIN_PERMISSION_SERVICE');

export interface IDomainPermissionService {
  hasPermission(
    churchId: number,
    requestUserId: number,
    domainAction: DomainAction,
  ): Promise<boolean>;
}
