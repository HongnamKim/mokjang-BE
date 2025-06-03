import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IChurchUserDomainService } from './interface/church-user-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../../../user/entity/user.entity';
import {
  FindOptionsOrder,
  ILike,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchUserModel } from '../../entity/church-user.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { ChurchUserRole } from '../../../user/const/user-role.enum';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { ChurchUserDomainPaginationResultDto } from '../dto/church-user-domain-pagination-result.dto';
import { GetChurchUsersDto } from '../../dto/request/get-church-users.dto';
import { ChurchUserOrder } from '../../const/church-user-order.enum';

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

  async createChurchUser(
    church: ChurchModel,
    user: UserModel,
    member: MemberModel,
    role: ChurchUserRole,
    qr: QueryRunner,
  ) {
    const repository = this.getChurchUserRepository(qr);

    return repository.save({
      churchId: church.id,
      userId: user.id,
      member: member,
      role,
      joinedAt: new Date(),
      isPermissionActive: role !== ChurchUserRole.MEMBER,
    });
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

  async findChurchUserByMember(
    church: ChurchModel,
    member: MemberModel,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel> {
    const repository = this.getChurchUserRepository(qr);

    const churchUser = await repository.findOne({
      where: {
        churchId: church.id,
        memberId: member.id,
        leftAt: IsNull(),
      },
    });

    if (!churchUser) {
      throw new NotFoundException('해당 교회 가입 정보를 찾을 수 없습니다.');
    }

    return churchUser;
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
      throw new NotFoundException('해당 교회 가입 정보를 찾을 수 없습니다.');
    }

    return churchUser;
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
      throw new InternalServerErrorException(
        '교회 가입 정보 업데이트 도중 에러 발생',
      );
    }

    return result;
  }

  async leaveChurch(churchUser: ChurchUserModel, qr?: QueryRunner) {
    const repository = this.getChurchUserRepository(qr);

    if (churchUser.role === ChurchUserRole.OWNER) {
      throw new ConflictException('교회 소유자는 교회에서 탈퇴할 수 없습니다.');
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
      throw new InternalServerErrorException('교회 탈퇴 중 에러 발생');
    }

    return result;
  }
}
