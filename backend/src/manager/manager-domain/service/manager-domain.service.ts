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
import { ChurchUserRole } from '../../../user/const/user-role.enum';
import { ManagerDomainPaginationResultDto } from '../dto/manager-domain-pagination-result.dto';
import { IManagerDomainService } from './interface/manager-domain.service.interface';
import {
  BadRequestException,
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
      role: In([ChurchUserRole.MANAGER, ChurchUserRole.OWNER]),
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

  async findManagerModelById(
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
        role: In([ChurchUserRole.MANAGER, ChurchUserRole.OWNER]),
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
        role: In([ChurchUserRole.MANAGER, ChurchUserRole.OWNER]),
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

  async findManagerById(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel> {
    const repository = this.getRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        memberId: managerId,
        role: In([ChurchUserRole.MANAGER, ChurchUserRole.OWNER]),
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
