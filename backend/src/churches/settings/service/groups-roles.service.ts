import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { GroupRoleModel } from '../entity/group/group-role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupsService } from './groups.service';
import { CreateGroupRoleDto } from '../dto/group/create-group-role.dto';
import { UpdateGroupRoleDto } from '../dto/group/update-group-role.dto';

@Injectable()
export class GroupsRolesService {
  constructor(
    @InjectRepository(GroupRoleModel)
    private readonly groupRolesRepository: Repository<GroupRoleModel>,
    private readonly groupsService: GroupsService,
  ) {}

  private getGroupRolesRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(GroupRoleModel)
      : this.groupRolesRepository;
  }

  async createRoleForAllGroups(churchId: number, dto: CreateGroupRoleDto) {
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
  }

  async getGroupRoles(churchId: number, groupId: number) {
    const groupRolesRepository = this.getGroupRolesRepository();

    return groupRolesRepository.find({
      where: {
        churchId,
        groupId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async getGroupRoleById(
    churchId: number,
    groupId: number,
    groupRoleId: number,
    qr?: QueryRunner,
  ) {
    const groupRolesRepository = this.getGroupRolesRepository(qr);

    const role = await groupRolesRepository.findOne({
      where: {
        churchId,
        groupId,
        id: groupRoleId,
      },
    });

    if (!role) {
      throw new NotFoundException('해당 그룹에 존재하지 않는 역할입니다.');
    }

    return role;
  }

  async createGroupRole(
    churchId: number,
    groupId: number,
    dto: CreateGroupRoleDto,
  ) {
    const group = await this.groupsService.getGroupById(churchId, groupId);

    const groupRolesRepository = this.getGroupRolesRepository();

    const isExist = !!(await groupRolesRepository.findOne({
      where: {
        churchId,
        groupId,
        role: dto.role,
      },
    }));

    if (isExist) {
      throw new BadRequestException('해당 그룹에 이미 존재하는 역할입니다.');
    }

    const newRole = await groupRolesRepository.save({
      role: dto.role,
      church: {
        id: churchId,
      },
      group,
    });

    return groupRolesRepository.findOne({ where: { id: newRole.id } });
  }

  async updateGroupRole(
    churchId: number,
    groupId: number,
    roleId: number,
    dto: UpdateGroupRoleDto,
  ) {
    const groupRolesRepository = this.getGroupRolesRepository();

    const isExist = !!(await groupRolesRepository.findOne({
      where: {
        churchId,
        groupId,
        role: dto.role,
      },
    }));

    if (isExist) {
      throw new BadRequestException('해당 그룹에 이미 존재하는 역할입니다.');
    }

    const result = await groupRolesRepository.update(
      {
        id: roleId,
        churchId,
        groupId,
      },
      {
        role: dto.role,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 그룹 내 역할을 찾을 수 없습니다.');
    }

    return groupRolesRepository.findOne({
      where: {
        id: roleId,
        churchId,
        groupId: groupId,
      },
    });
  }

  async deleteGroupRole(churchId: number, groupId: number, roleId: number) {
    const groupRolesRepository = this.getGroupRolesRepository();

    const result = await groupRolesRepository.softDelete({
      id: roleId,
      churchId,
      groupId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 그룹 내 역할을 찾을 수 없습니다.');
    }

    return 'ok';
  }
}
