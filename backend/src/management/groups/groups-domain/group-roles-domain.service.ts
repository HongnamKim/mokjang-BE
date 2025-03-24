import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IGroupRolesDomainService } from './interface/groups-roles-domain.service.interface';
import { GroupModel } from '../entity/group.entity';
import { CreateGroupRoleDto } from '../dto/create-group-role.dto';
import { QueryRunner, Repository } from 'typeorm';
import { GroupRoleModel } from '../entity/group-role.entity';
import { UpdateGroupRoleDto } from '../dto/update-group-role.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GroupRolesDomainService implements IGroupRolesDomainService {
  constructor(
    @InjectRepository(GroupRoleModel)
    private readonly groupRolesRepository: Repository<GroupRoleModel>,
  ) {}

  private getGroupRolesRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(GroupRoleModel)
      : this.groupRolesRepository;
  }

  // TODO soft deleted 된 역할과 동일한 역할 생성 시 로직 보완 필요
  async createGroupRole(
    churchId: number,
    group: GroupModel,
    dto: CreateGroupRoleDto,
    qr?: QueryRunner,
  ): Promise<GroupRoleModel> {
    const groupRolesRepository = this.getGroupRolesRepository(qr);

    const existingGroupRole = await groupRolesRepository.findOne({
      where: {
        churchId,
        groupId: group.id,
        role: dto.role,
      },
      withDeleted: true,
      relations: {
        members: true,
      },
    });

    if (existingGroupRole) {
      // soft deleted 되지 않은 역할
      if (!existingGroupRole.deletedAt) {
        throw new BadRequestException('해당 그룹에 이미 존재하는 역할입니다.');
      }

      // soft deleted 된 역할
      await groupRolesRepository.remove(existingGroupRole);
    }

    const result = await groupRolesRepository.insert({
      role: dto.role,
      church: {
        id: churchId,
      },
      group,
    });

    const newRole = await groupRolesRepository.findOne({
      where: { id: result.identifiers[0].id },
    });

    if (!newRole) {
      throw new InternalServerErrorException('그룹 역할 생성 중 에러 발생');
    }

    return newRole;
  }

  async deleteGroupRole(
    churchId: number,
    groupId: number,
    roleId: number,
  ): Promise<string> {
    const groupRolesRepository = this.getGroupRolesRepository();

    const targetGroupRole = await this.findGroupRoleById(
      churchId,
      groupId,
      roleId,
    );

    if (targetGroupRole.members.length > 0) {
      throw new ConflictException('해당 그룹 역할을 가진 교인이 존재합니다.');
    }

    await groupRolesRepository.softRemove(targetGroupRole);

    return `groupRoleId ${roleId} deleted`;
  }

  async findGroupRoleById(
    churchId: number,
    groupId: number,
    groupRoleId: number,
    qr?: QueryRunner,
  ): Promise<GroupRoleModel> {
    const groupRolesRepository = this.getGroupRolesRepository(qr);

    const role = await groupRolesRepository.findOne({
      where: {
        churchId,
        groupId: groupId,
        id: groupRoleId,
      },
      relations: {
        members: true,
      },
    });

    if (!role) {
      throw new NotFoundException('해당 그룹에 존재하지 않는 역할입니다.');
    }

    return role;
  }

  findGroupRoles(churchId: number, groupId: number): Promise<GroupRoleModel[]> {
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

  async updateGroupRole(
    churchId: number,
    groupId: number,
    roleId: number,
    dto: UpdateGroupRoleDto,
  ): Promise<GroupRoleModel> {
    const groupRolesRepository = this.getGroupRolesRepository();

    const targetGroupRole = await groupRolesRepository.findOne({
      where: {
        churchId,
        groupId,
        id: roleId,
      },
    });

    if (!targetGroupRole) {
      throw new NotFoundException('해당 그룹 내 역할을 찾을 수 없습니다.');
    }

    const isExistGroupRole = await this.isExistGroupRole(
      churchId,
      groupId,
      dto.role,
    );

    if (isExistGroupRole) {
      throw new BadRequestException('해당 그룹에 이미 존재하는 역할입니다.');
    }

    targetGroupRole.role = dto.role;

    await groupRolesRepository.save(targetGroupRole);

    return targetGroupRole;
  }

  private async isExistGroupRole(
    churchId: number,
    groupId: number,
    role: string,
    qr?: QueryRunner,
  ) {
    const groupRolesRepository = this.getGroupRolesRepository(qr);

    const roleModel = await groupRolesRepository.findOne({
      where: {
        churchId,
        groupId,
        role,
      },
    });

    console.log(roleModel);

    return !!roleModel;
  }
}
