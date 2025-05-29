import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  ILike,
  In,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { IManagerDomainService } from './interface/manager-domain.service.interface';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetManagersDto } from '../../dto/request/get-managers.dto';
import { ManagerDomainPaginationResultDto } from '../dto/manager-domain-pagination-result.dto';
import { UserRole } from '../../../user/const/user-role.enum';
import { MemberOrderCriteria } from '../../const/manager-order.enum';
import {
  ManagerFindOptionsRelations,
  ManagerFindOptionsSelect,
  ManagersFindOptionsRelations,
  ManagersFindOptionsSelect,
} from '../../const/manager-find-options.const';
import { ManagerException } from '../../exception/manager.exception';
import { PermissionTemplateModel } from '../../../permission/entity/permission-template.entity';

@Injectable()
export class ManagerDomainService implements IManagerDomainService {
  constructor(
    @InjectRepository(MemberModel)
    private readonly membersRepository: Repository<MemberModel>,
  ) {}

  private getManagerRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.membersRepository;
  }

  async findManagers(
    church: ChurchModel,
    dto: GetManagersDto,
    qr?: QueryRunner,
  ): Promise<ManagerDomainPaginationResultDto> {
    const repository = this.getManagerRepository(qr);

    const order: FindOptionsOrder<MemberModel> = {};

    if (MemberOrderCriteria.includes(dto.order)) {
      // 정렬 기준이 MemberModel 에 속할 경우
      order[dto.order] = dto.orderDirection;
    } else {
      // 정렬 기준이 UserModel 에 속할 경우
      order['user'] = { [dto.order]: dto.orderDirection };
    }

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          churchId: church.id,
          user: {
            //churchId: church.id,
            role: In([UserRole.MANAGER, UserRole.OWNER]),
          },
          name: dto.name && ILike(`%${dto.name}%`),
        },
        relations: ManagersFindOptionsRelations,
        select: ManagersFindOptionsSelect,
        order,
      }),
      repository.count({
        where: {
          churchId: church.id,
          user: {
            role: In([UserRole.MANAGER, UserRole.OWNER]),
          },
          name: dto.name && ILike(`%${dto.name}%`),
        },
      }),
    ]);

    return new ManagerDomainPaginationResultDto(data, totalCount);
  }

  async findManagerModelById(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel> {
    const repository = this.getManagerRepository(qr);

    const manager = await repository.findOne({
      where: {
        churchId: church.id,
        id: managerId,
        user: {
          //churchId: church.id,
          role: In([UserRole.MANAGER, UserRole.OWNER]),
        },
      },
      relations: { ...relationOptions, user: true },
    });

    if (!manager) {
      throw new NotFoundException(ManagerException.NOT_FOUND);
    }

    return manager;
  }

  async findManagerById(
    church: ChurchModel,
    managerId: number,
    qr?: QueryRunner,
  ): Promise<MemberModel> {
    const repository = this.getManagerRepository(qr);

    const manager = await repository.findOne({
      where: {
        churchId: church.id,
        id: managerId,
        user: {
          //churchId: church.id,
          role: In([UserRole.MANAGER, UserRole.OWNER]),
        },
      },
      relations: ManagerFindOptionsRelations,
      select: ManagerFindOptionsSelect,
    });

    if (!manager) {
      throw new NotFoundException(ManagerException.NOT_FOUND);
    }

    return manager;
  }

  async updatePermissionActive(
    manager: MemberModel,
    activity: boolean,
    qr?: QueryRunner,
  ) {
    const repository = this.getManagerRepository(qr);

    if (manager.user.role !== UserRole.MANAGER) {
      throw new BadRequestException(
        '관리자 권한의 교인만 활성 상태를 변경할 수 있습니다.',
      );
    }

    const result = await repository.update(
      { id: manager.id },
      { isPermissionActive: activity },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ManagerException.UPDATE_ERROR);
    }

    return result;
  }

  async assignPermissionTemplate(
    manager: MemberModel,
    permissionTemplate: PermissionTemplateModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getManagerRepository(qr);

    if (manager.user.role !== UserRole.MANAGER) {
      throw new BadRequestException(
        '관리자 권한의 교인에게만 권한 유형을 부여할 수 있습니다.',
      );
    }

    const result = await repository.update(
      { id: manager.id },
      { permissionTemplateId: permissionTemplate.id },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ManagerException.UPDATE_ERROR);
    }

    return result;
  }

  async unassignPermissionTemplate(
    manager: MemberModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getManagerRepository(qr);

    if (!manager.permissionTemplate) {
      throw new BadRequestException('부여된 권한 유형이 없습니다.');
    }

    const result = await repository.update(
      { id: manager.id },
      { permissionTemplateId: null },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ManagerException.UPDATE_ERROR);
    }

    return result;
  }
}
