/*
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IGroupRolesDomainService } from '../interface/groups-roles-domain.service.interface';
import { GroupModel } from '../../entity/group.entity';
import { CreateGroupRoleDto } from '../../dto/group-role/create-group-role.dto';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  QueryRunner,
  Repository,
} from 'typeorm';
import { GroupRoleModel } from '../../entity/group-role.entity';
import { UpdateGroupRoleDto } from '../../dto/group-role/update-group-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupRoleException } from '../../const/exception/group-role.exception';
import { GetGroupRoleDto } from '../../dto/group-role/get-group-role.dto';
import { GroupRoleDomainPaginationResultDto } from '../../dto/group-role/group-role-domain-pagination-result.dto';
import { GroupRoleOrderEnum } from '../../const/group-role-order.enum';

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

  async findGroupRoles(
    group: GroupModel,
    dto: GetGroupRoleDto,
  ): Promise<GroupRoleDomainPaginationResultDto> {
    const groupRolesRepository = this.getGroupRolesRepository();

    const order: FindOptionsOrder<GroupRoleModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== GroupRoleOrderEnum.createdAt) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      groupRolesRepository.find({
        where: {
          groupId: group.id,
        },
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      groupRolesRepository.count({
        where: {
          groupId: group.id,
        },
      }),
    ]);

    return new GroupRoleDomainPaginationResultDto(data, totalCount);
  }

  // TODO soft deleted 된 역할과 동일한 역할 생성 시 로직 보완 필요
  async createGroupRole(
    group: GroupModel,
    dto: CreateGroupRoleDto,
    qr?: QueryRunner,
  ): Promise<GroupRoleModel> {
    const groupRolesRepository = this.getGroupRolesRepository(qr);

    const existingGroupRole = await groupRolesRepository.findOne({
      where: {
        groupId: group.id,
        role: dto.role,
      },
      withDeleted: true,
      relations: {
        //members: true,
      },
    });

    if (existingGroupRole) {
      // soft deleted 되지 않은 역할
      if (!existingGroupRole.deletedAt) {
        throw new BadRequestException(GroupRoleException.ALREADY_EXIST);
      }

      // soft deleted 된 역할
      await groupRolesRepository.remove(existingGroupRole);
    }

    return groupRolesRepository.save({
      groupId: group.id,
      role: dto.role,
    });
  }

  async deleteGroupRole(targetGroupRole: GroupRoleModel): Promise<void> {
    const groupRolesRepository = this.getGroupRolesRepository();

    if (targetGroupRole.members.length > 0) {
      throw new ConflictException(
        GroupRoleException.GROUP_ROLE_HAS_DEPENDENCIES,
      );
    }

    await groupRolesRepository.softRemove(targetGroupRole);

    return;
  }

  async findGroupRoleModelById(
    group: GroupModel,
    groupRoleId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupRoleModel>,
  ) {
    const groupRolesRepository = this.getGroupRolesRepository(qr);

    const role = await groupRolesRepository.findOne({
      where: {
        groupId: group.id,
        id: groupRoleId,
      },
      relations: relationOptions,
    });

    if (!role) {
      throw new NotFoundException(GroupRoleException.NOT_FOUND);
    }

    return role;
  }

  async findGroupRoleById(
    group: GroupModel,
    groupRoleId: number,
    qr?: QueryRunner,
  ): Promise<GroupRoleModel> {
    const groupRolesRepository = this.getGroupRolesRepository(qr);

    const role = await groupRolesRepository.findOne({
      where: {
        groupId: group.id,
        id: groupRoleId,
      },
      relations: {
        members: true,
      },
    });

    if (!role) {
      throw new NotFoundException(GroupRoleException.NOT_FOUND);
    }

    return role;
  }

  async updateGroupRole(
    targetGroupRole: GroupRoleModel,
    dto: UpdateGroupRoleDto,
  ): Promise<GroupRoleModel> {
    const groupRolesRepository = this.getGroupRolesRepository();

    const isExistGroupRole = await this.isExistGroupRole(
      targetGroupRole.groupId,
      dto.role,
    );

    if (isExistGroupRole) {
      throw new BadRequestException(GroupRoleException.ALREADY_EXIST);
    }

    targetGroupRole.role = dto.role;

    await groupRolesRepository.save(targetGroupRole);

    return targetGroupRole;
  }

  private async isExistGroupRole(
    groupId: number,
    role: string,
    qr?: QueryRunner,
  ) {
    const groupRolesRepository = this.getGroupRolesRepository(qr);

    const roleModel = await groupRolesRepository.findOne({
      where: {
        groupId,
        role,
      },
    });

    return !!roleModel;
  }
}
*/
