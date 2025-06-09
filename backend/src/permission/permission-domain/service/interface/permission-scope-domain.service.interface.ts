import { ChurchUserModel } from '../../../../church-user/entity/church-user.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { PermissionScopeModel } from '../../../entity/permission-scope.entity';
import { GroupModel } from '../../../../management/groups/entity/group.entity';

export const IPERMISSION_SCOPE_DOMAIN_SERVICE = Symbol(
  'IPERMISSION_SCOPE_DOMAIN_SERVICE',
);

export interface IPermissionScopeDomainService {
  findPermissionScopeByChurchUserId(
    churchUser: ChurchUserModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<PermissionScopeModel>,
  ): Promise<PermissionScopeModel[]>;

  createAllGroupPermissionScope(
    churchUser: ChurchUserModel,
    qr: QueryRunner,
  ): Promise<PermissionScopeModel>;

  createPermissionScope(
    churchUser: ChurchUserModel,
    groups: GroupModel[],
    qr: QueryRunner,
  ): Promise<PermissionScopeModel[]>;

  deletePermissionScope(
    toRemove: PermissionScopeModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  applyPermissionScopeChange(
    churchUser: ChurchUserModel,
    toCreate: GroupModel[],
    toRemove: PermissionScopeModel[],
    qr: QueryRunner,
  ): Promise<void>;
}
