import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateGroupRoleDto } from '../dto/group-role/create-group-role.dto';
import { UpdateGroupRoleDto } from '../dto/group-role/update-group-role.dto';
import {
  IGROUP_ROLES_DOMAIN_SERVICE,
  IGroupRolesDomainService,
} from '../groups-domain/interface/groups-roles-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../groups-domain/interface/groups-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import { GetGroupRoleDto } from '../dto/group-role/get-group-role.dto';
import { GroupRolePaginationResultDto } from '../dto/response/group-role-pagination-result.dto';
import { GroupRoleDeleteResponseDto } from '../dto/response/group-role-delete-response.dto';

@Injectable()
export class GroupRolesService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,

    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,

    @Inject(IGROUP_ROLES_DOMAIN_SERVICE)
    private readonly groupRoleDomainService: IGroupRolesDomainService,
  ) {}

  /*async createRoleForAllGroups(churchId: number, dto: CreateGroupRoleDto) {
    const leafGroups = (await this.groupsService.getGroups(churchId))
      .filter((group) => !group.childGroupIds.length)
      .map((group) => ({ id: group.id, name: group.name }));

    type ResultType = {
      id: number;
      name: string;
      status: 'fulfilled' | 'rejected';
      message: string;
    };

    const results = await Promise.allSettled(
      leafGroups.map(async (group) => {
        try {
          await this.createGroupRole(churchId, group.id, dto);

          return {
            id: group.id,
            name: group.name,
            status: 'fulfilled',
            message: 'group role created successfully',
          } as ResultType;
        } catch (error) {
          return {
            id: group.id,
            name: group.name,
            status: 'rejected',
            message: error.message,
          } as ResultType;
        }
      }),
    );

    const fulFilledResults = results.filter(
      (result) => result.status === 'fulfilled',
    );

    const successResults = fulFilledResults
      .filter((result) => result.value.status === 'fulfilled')
      .map((result) => ({ id: result.value.id, name: result.value.name }));

    const failedResults = fulFilledResults
      .filter((result) => result.value.status === 'rejected')
      .map((result) => ({
        id: result.value.id,
        name: result.value.name,
        message: result.value.message,
      }));

    return {
      successResults,
      failedResults,
    };
  }*/

  async getGroupRoles(churchId: number, groupId: number, dto: GetGroupRoleDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
    );

    const result = await this.groupRoleDomainService.findGroupRoles(group, dto);

    return new GroupRolePaginationResultDto(
      result.data,
      result.totalCount,
      result.data.length,
      dto.page,
      Math.ceil(result.totalCount / dto.take),
    );
  }

  async getGroupRoleById(
    churchId: number,
    groupId: number,
    groupRoleId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
    );

    return this.groupRoleDomainService.findGroupRoleById(
      group,
      groupRoleId,
      qr,
    );
  }

  async createGroupRole(
    churchId: number,
    groupId: number,
    dto: CreateGroupRoleDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
    );

    return this.groupRoleDomainService.createGroupRole(group, dto, qr);
  }

  async updateGroupRole(
    churchId: number,
    groupId: number,
    roleId: number,
    dto: UpdateGroupRoleDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
    );

    const groupRole = await this.groupRoleDomainService.findGroupRoleModelById(
      group,
      roleId,
    );

    return this.groupRoleDomainService.updateGroupRole(groupRole, dto);
  }

  async deleteGroupRole(churchId: number, groupId: number, roleId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
    );

    const groupRole = await this.groupRoleDomainService.findGroupRoleModelById(
      group,
      roleId,
      undefined,
      { members: true },
    );

    await this.groupRoleDomainService.deleteGroupRole(groupRole);

    return new GroupRoleDeleteResponseDto(
      new Date(),
      groupRole.id,
      groupRole.role,
      true,
    );
  }
}
