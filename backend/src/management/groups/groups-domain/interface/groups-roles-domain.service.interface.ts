import { GroupRoleModel } from '../../entity/group-role.entity';
import { QueryRunner } from 'typeorm';
import { CreateGroupRoleDto } from '../../dto/create-group-role.dto';
import { UpdateGroupRoleDto } from '../../dto/update-group-role.dto';
import { GroupModel } from '../../entity/group.entity';

export const IGROUP_ROLES_DOMAIN_SERVICE = Symbol(
  'IGROUP_ROLES_DOMAIN_SERVICE',
);

export interface IGroupRolesDomainService {
  findGroupRoles(churchId: number, groupId: number): Promise<GroupRoleModel[]>;

  findGroupRoleById(
    churchId: number,
    groupId: number,
    groupRoleId: number,
    qr?: QueryRunner,
  ): Promise<GroupRoleModel>;

  createGroupRole(
    churchId: number,
    group: GroupModel,
    dto: CreateGroupRoleDto,
    qr?: QueryRunner,
  ): Promise<GroupRoleModel>;

  updateGroupRole(
    churchId: number,
    groupId: number,
    roleId: number,
    dto: UpdateGroupRoleDto,
  ): Promise<GroupRoleModel>;

  deleteGroupRole(
    churchId: number,
    groupId: number,
    roleId: number,
  ): Promise<string>;
}
