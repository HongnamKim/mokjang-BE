import { GroupRoleModel } from '../../entity/group-role.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateGroupRoleDto } from '../../dto/group-role/create-group-role.dto';
import { UpdateGroupRoleDto } from '../../dto/group-role/update-group-role.dto';
import { GroupModel } from '../../entity/group.entity';
import { GetGroupRoleDto } from '../../dto/group-role/get-group-role.dto';
import { GroupRoleDomainPaginationResultDto } from '../../dto/group-role/group-role-domain-pagination-result.dto';

export const IGROUP_ROLES_DOMAIN_SERVICE = Symbol(
  'IGROUP_ROLES_DOMAIN_SERVICE',
);

export interface IGroupRolesDomainService {
  findGroupRoles(
    group: GroupModel,
    dto: GetGroupRoleDto,
  ): Promise<GroupRoleDomainPaginationResultDto>;

  findGroupRoleModelById(
    group: GroupModel,
    groupRoleId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupRoleModel>,
  ): Promise<GroupRoleModel>;

  findGroupRoleById(
    group: GroupModel,
    groupRoleId: number,
    qr?: QueryRunner,
  ): Promise<GroupRoleModel>;

  createGroupRole(
    group: GroupModel,
    dto: CreateGroupRoleDto,
    qr?: QueryRunner,
  ): Promise<GroupRoleModel>;

  updateGroupRole(
    targetGroupRole: GroupRoleModel,
    dto: UpdateGroupRoleDto,
  ): Promise<GroupRoleModel>;

  deleteGroupRole(targetGroupRole: GroupRoleModel): Promise<void>;
}
