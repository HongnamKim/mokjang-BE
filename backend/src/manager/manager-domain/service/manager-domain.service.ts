import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetManagersDto } from '../../dto/request/get-managers.dto';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ManagerOrder } from '../../const/manager-order.enum';
import {
  ChurchUserManagers,
  ChurchUserRole,
} from '../../../user/const/user-role.enum';
import { ManagerDomainPaginationResultDto } from '../dto/manager-domain-pagination-result.dto';
import { IManagerDomainService } from './interface/manager-domain.service.interface';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ManagerException } from '../../exception/manager.exception';
import { PermissionTemplateModel } from '../../../permission/entity/permission-template.entity';
import {
  ManagerFindOptionsRelations,
  ManagerFindOptionsSelect,
  ManagersFindOptionsRelations,
  ManagersFindOptionsSelect,
} from '../../const/manager-find-options.const';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { GetManagersByPermissionTemplateDto } from '../../../permission/dto/template/request/get-managers-by-permission-template.dto';

export class ManagerDomainService implements IManagerDomainService {
  constructor(
    @InjectRepository(ChurchUserModel)
    private readonly repository: Repository<ChurchUserModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(ChurchUserModel) : this.repository;
  }

  async findManagers(
    church: ChurchModel,
    dto: GetManagersDto,
    qr?: QueryRunner,
  ): Promise<ManagerDomainPaginationResultDto> {
    const repository = this.getRepository(qr);

    const orderOptions: FindOptionsOrder<ChurchUserModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== ManagerOrder.CREATED_AT) {
      orderOptions.createdAt = 'asc';
    }

    const whereOptions: FindOptionsWhere<ChurchUserModel> = {
      churchId: church.id,
      role: ChurchUserManagers,
      leftAt: IsNull(),
      member: {
        name: dto.name && ILike(`%${dto.name}%`),
      },
    };

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: whereOptions,
        order: orderOptions,
        relations: ManagersFindOptionsRelations,
        select: ManagersFindOptionsSelect,
      }),
      repository.count({
        where: whereOptions,
      }),
    ]);

    return new ManagerDomainPaginationResultDto(data, totalCount);
  }

  async findManagersByPermissionTemplate(
    church: ChurchModel,
    permissionTemplate: PermissionTemplateModel,
    dto: GetManagersByPermissionTemplateDto,
    qr?: QueryRunner,
  ): Promise<ManagerDomainPaginationResultDto> {
    const repository = this.getRepository(qr);

    const whereOptions: FindOptionsWhere<ChurchUserModel> = {
      churchId: church.id,
      role: ChurchUserManagers,
      permissionTemplateId: permissionTemplate.id,
    };

    const orderOptions: FindOptionsOrder<ChurchUserModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== ManagerOrder.CREATED_AT) {
      orderOptions.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: whereOptions,
        relations: {
          member: MemberSummarizedRelation,
        },
        select: {
          member: MemberSummarizedSelect,
        },
        take: dto.take,
        order: orderOptions,
        skip: dto.take * (dto.page - 1),
      }),
      repository.count({
        where: whereOptions,
      }),
    ]);

    return new ManagerDomainPaginationResultDto(data, totalCount);
  }

  async findManagerModelById(
    church: ChurchModel,
    churchUserId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchUserModel>,
  ) {
    const repository = this.getRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        id: churchUserId,
        role: ChurchUserManagers,
        leftAt: IsNull(),
      },
      relations: relationOptions,
    });

    if (!churchUser) {
      throw new NotFoundException(ManagerException.NOT_FOUND);
    }

    return churchUser;
  }

  async findManagerModelByMemberId(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchUserModel>,
  ): Promise<ChurchUserModel> {
    const repository = this.getRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        memberId: managerId,
        role: ChurchUserManagers,
        leftAt: IsNull(),
      },
      relations: relationOptions,
    });

    if (!churchUser) {
      throw new NotFoundException(ManagerException.NOT_FOUND);
    }

    return churchUser;
  }

  async findManagerByUserId(
    church: ChurchModel,
    userId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        userId: userId,
        role: In([ChurchUserRole.MANAGER, ChurchUserRole.OWNER]), //ChurchUserManagers,
        leftAt: IsNull(),
      },
      relations: ManagerFindOptionsRelations,
      select: ManagerFindOptionsSelect,
    });

    if (!churchUser) {
      throw new NotFoundException(ManagerException.NOT_FOUND);
    }

    return churchUser;
  }

  async findManagerForPermissionCheck(
    church: ChurchModel,
    userId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        userId: userId,
        role: In([ChurchUserRole.MANAGER, ChurchUserRole.OWNER]), //ChurchUserManagers,
        leftAt: IsNull(),
      },
      relations: ManagerFindOptionsRelations,
      select: ManagerFindOptionsSelect,
    });

    if (!churchUser) {
      throw new ForbiddenException(ManagerException.FORBIDDEN);
    }

    return churchUser;
  }

  async findManagersByMemberIds(
    church: ChurchModel,
    memberIds: number[],
    qr?: QueryRunner,
  ): Promise<ChurchUserModel[]> {
    const repository = this.getRepository(qr);

    const managers = await repository.find({
      where: {
        churchId: church.id,
        memberId: In(memberIds),
        role: ChurchUserManagers,
      },
      relations: {
        member: MemberSummarizedRelation,
      },
      select: {
        member: MemberSummarizedSelect,
      },
    });

    // 요청한 매니저들을 모두 찾지 못한 경우
    if (managers.length !== memberIds.length) {
      const findManagerMemberIds = new Set(
        managers.map((manager) => manager.memberId),
      );
      const failed: { receiverId: number; reason: string }[] = [];

      memberIds.forEach((managerId) => {
        if (!findManagerMemberIds.has(managerId)) {
          failed.push({
            receiverId: managerId,
            reason: ManagerException.NOT_FOUND,
          });
        }
      });

      throw new NotFoundException(failed);
    }

    return managers;
  }

  async findManagerById(
    church: ChurchModel,
    churchUserId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel> {
    const repository = this.getRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        id: churchUserId,
        role: ChurchUserManagers,
        leftAt: IsNull(),
      },
      relations: ManagerFindOptionsRelations,
      select: ManagerFindOptionsSelect,
    });

    if (!churchUser) {
      throw new NotFoundException(ManagerException.NOT_FOUND);
    }

    return churchUser;
  }

  async findManagerByMemberId(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel> {
    const repository = this.getRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        memberId: managerId,
        role: ChurchUserManagers,
        leftAt: IsNull(),
      },
      relations: ManagerFindOptionsRelations,
      select: ManagerFindOptionsSelect,
    });

    if (!churchUser) {
      throw new NotFoundException(ManagerException.NOT_FOUND);
    }

    return churchUser;
  }

  async updatePermissionActive(
    churchUser: ChurchUserModel,
    activity: boolean,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    if (churchUser.role !== ChurchUserRole.MANAGER) {
      throw new BadRequestException(ManagerException.CANNOT_CHANGE_ACTIVITY);
    }

    const result = await repository.update(
      {
        id: churchUser.id,
      },
      {
        isPermissionActive: activity,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ManagerException.UPDATE_ERROR);
    }

    return result;
  }

  async assignPermissionTemplate(
    churchUser: ChurchUserModel,
    permissionTemplate: PermissionTemplateModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    if (churchUser.role === ChurchUserRole.OWNER) {
      throw new BadRequestException(
        ManagerException.CANNOT_ASSIGN_PERMISSION_OWNER,
      );
    }
    if (churchUser.role !== ChurchUserRole.MANAGER) {
      throw new BadRequestException(ManagerException.CANNOT_ASSIGN_PERMISSION);
    }

    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: churchUser.id,
      },
      {
        permissionTemplateId: permissionTemplate.id,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ManagerException.UPDATE_ERROR);
    }

    return result;
  }

  async unassignPermissionTemplate(
    churchUser: ChurchUserModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: churchUser.id,
      },
      {
        permissionTemplateId: null,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ManagerException.UPDATE_ERROR);
    }

    return result;
  }
}
