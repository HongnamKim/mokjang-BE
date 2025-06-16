import { DomainAction } from '../const/domain-action.enum';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchModel } from '../../churches/entity/church.entity';

export const IDOMAIN_PERMISSION_SERVICE = Symbol('IDOMAIN_PERMISSION_SERVICE');

export interface IDomainPermissionService {
  hasPermission(
    churchId: number,
    requestUserId: number,
    domainAction: DomainAction,
  ): Promise<{ requestManager: ChurchUserModel; church: ChurchModel } | null>;

  getRequestManagerOrThrow(
    churchId: number,
    requestUserId: number,
  ): Promise<{ requestManager: ChurchUserModel; church: ChurchModel }>;
}
