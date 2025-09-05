import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IChurchUserDomainService } from './interface/church-user-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../../../user/entity/user.entity';
import {
  DeleteResult,
  FindOptionsOrder,
  ILike,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchUserModel } from '../../entity/church-user.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { ChurchUserRole } from '../../../user/const/user-role.enum';
import {
  MemberSimpleSelect,
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { ChurchUserDomainPaginationResultDto } from '../dto/church-user-domain-pagination-result.dto';
import { GetChurchUsersDto } from '../../dto/request/get-church-users.dto';
import { ChurchUserOrder } from '../../const/church-user-order.enum';
import { ChurchUserException } from '../../exception/church-user.exception';

@Injectable()
export class ChurchUserDomainService implements IChurchUserDomainService {
  constructor(
    @InjectRepository(ChurchUserModel)
    private readonly churchUserRepository: Repository<ChurchUserModel>,
  ) {}

  private getChurchUserRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(ChurchUserModel)
      : this.churchUserRepository;
  }

  async assertCanRequestJoinChurch(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<boolean> {
    const repository = this.getChurchUserRepository(qr);

    const isJoined = await repository.findOne({
      where: {
        userId: user.id,
        leftAt: IsNull(),
      },
    });

    return !!isJoined;
  }

  private async isExistChurchUser(
    church: ChurchModel,
    user: UserModel,
    member: MemberModel,
    qr: QueryRunner,
  ) {
    const repository = this.getChurchUserRepository(qr);

    const isExist = await repository.findOne({
      where: {
        churchId: church.id,
        userId: user.id,
        memberId: member.id,
      },
    });

    return !!isExist;
  }

  async createChurchUser(
    church: ChurchModel,
    user: UserModel,
    member: MemberModel,
    role: ChurchUserRole,
    qr: QueryRunner,
  ) {
    const repository = this.getChurchUserRepository(qr);

    const isExist = await this.isExistChurchUser(church, user, member, qr);

    if (isExist) {
      throw new BadRequestException(ChurchUserException.ALREADY_EXIST);
    }

    return repository.save({
      churchId: church.id,
      userId: user.id,
      member: member,
      role,
      joinedAt: new Date(),
      isPermissionActive: role !== ChurchUserRole.MEMBER,
    });
  }

  async findChurchUserById(
    church: ChurchModel,
    churchUserId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getChurchUserRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        id: churchUserId,
      },
      relations: {
        member: MemberSummarizedRelation,
      },
      select: {
        member: MemberSimpleSelect,
      },
    });

    if (!churchUser) {
      throw new NotFoundException(ChurchUserException.NOT_FOUND);
    }

    return churchUser;
  }

  async findChurchUserByUserId(
    userId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel> {
    const repository = this.getChurchUserRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        userId: userId,
        leftAt: IsNull(),
      },
      relations: {
        member: MemberSummarizedRelation,
      },
      select: {
        member: MemberSummarizedSelect,
      },
    });

    if (!churchUser) {
      throw new NotFoundException();
    }

    return churchUser;
  }

  async findChurchUsers(
    church: ChurchModel,
    dto: GetChurchUsersDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getChurchUserRepository(qr);

    const order: FindOptionsOrder<ChurchUserModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== ChurchUserOrder.CREATED_AT) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          churchId: church.id,
          leftAt: IsNull(),
          role: dto.role ? dto.role : undefined,
          member: {
            name: dto.name && ILike(`%${dto.name}%`),
          },
        },
        order,
        relations: {
          member: MemberSummarizedRelation,
          user: true,
        },
        select: {
          member: MemberSummarizedSelect,
          user: {
            id: true,
            name: true,
            mobilePhone: true,
          },
        },
      }),
      repository.count({
        where: {
          churchId: church.id,
          leftAt: IsNull(),
          role: dto.role ? dto.role : undefined,
          member: {
            name: dto.name && ILike(`%${dto.name}%`),
          },
        },
      }),
    ]);

    return new ChurchUserDomainPaginationResultDto(data, totalCount);
  }

  async findChurchUserByUser(
    church: ChurchModel,
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel> {
    const repository = this.getChurchUserRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        userId: user.id,
        leftAt: IsNull(),
      },
      relations: {
        member: MemberSummarizedRelation,
        user: true,
      },
      select: {
        member: MemberSummarizedSelect,
        user: {
          id: true,
          name: true,
          mobilePhone: true,
        },
      },
    });

    if (!churchUser) {
      throw new NotFoundException(ChurchUserException.NOT_FOUND);
    }

    return churchUser;
  }

  async updateLinkedMember(
    targetChurchUser: ChurchUserModel,
    targetMember: MemberModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getChurchUserRepository(qr);

    const result = await repository.update(
      {
        id: targetChurchUser.id,
      },
      {
        memberId: targetMember.id,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchUserException.UPDATE_ERROR);
    }

    return result;
  }

  async unlinkMember(
    targetChurchUser: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getChurchUserRepository(qr);

    const result = await repository.update(
      {
        id: targetChurchUser.id,
      },
      {
        memberId: null,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchUserException.UPDATE_ERROR);
    }

    return result;
  }

  async updateChurchUserRole(
    churchUser: ChurchUserModel,
    role: ChurchUserRole,
    qr?: QueryRunner,
  ) {
    const repository = this.getChurchUserRepository(qr);

    const result = await repository.update(
      {
        id: churchUser.id,
      },
      {
        role: role,
        isPermissionActive:
          role === ChurchUserRole.MANAGER || role === ChurchUserRole.OWNER,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchUserException.UPDATE_ERROR);
    }

    return result;
  }

  async leaveChurch(churchUser: ChurchUserModel, qr?: QueryRunner) {
    const repository = this.getChurchUserRepository(qr);

    if (churchUser.role === ChurchUserRole.OWNER) {
      throw new ConflictException(ChurchUserException.OWNER_CANNOT_LEAVE);
    }

    const result = await repository.update(
      {
        id: churchUser.id,
      },
      {
        memberId: null,
        permissionTemplateId: null,
        role: ChurchUserRole.NONE,
        leftAt: new Date(),
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchUserException.DELETE_ERROR);
    }

    return result;
  }

  deleteChurchUserCascade(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<DeleteResult> {
    const repository = this.getChurchUserRepository(qr);

    return repository.delete({ churchId: church.id });
  }
}
