import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IChurchJoinRequestDomainService } from '../interface/church-join-requests-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ChurchJoinModel } from '../../entity/church-join.entity';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UserModel } from '../../../user/entity/user.entity';
import { ChurchJoinRequestStatusEnum } from '../../const/church-join-request-status.enum';
import { GetJoinRequestDto } from '../../dto/request/get-join-request.dto';
import { ChurchJoinException } from '../../exception/church-join.exception';

@Injectable()
export class ChurchJoinRequestsDomainService
  implements IChurchJoinRequestDomainService
{
  constructor(
    @InjectRepository(ChurchJoinModel)
    private readonly churchJoinRequestsRepository: Repository<ChurchJoinModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(ChurchJoinModel)
      : this.churchJoinRequestsRepository;
  }

  async ensureUserCanRequestJoinChurch(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<boolean> {
    const repository = this.getRepository(qr);

    const joinRequest = await repository.find({
      where: {
        userId: user.id,
        status: ChurchJoinRequestStatusEnum.PENDING,
      },
    });

    if (joinRequest.length > 0) {
      throw new BadRequestException(ChurchJoinException.ALREADY_EXIST);
    }

    return true;
  }

  async createChurchJoinRequest(
    church: ChurchModel,
    user: UserModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.save({
      churchId: church.id,
      user,
      status: ChurchJoinRequestStatusEnum.PENDING,
    });
  }

  private parseCreatedAt(dto: GetJoinRequestDto) {
    if (dto.toCreatedAt && dto.fromCreatedAt) {
      return Between(dto.fromCreatedAt, dto.toCreatedAt);
    } else if (dto.toCreatedAt && !dto.fromCreatedAt) {
      return LessThanOrEqual(dto.toCreatedAt);
    } else if (!dto.toCreatedAt && dto.fromCreatedAt) {
      return MoreThanOrEqual(dto.fromCreatedAt);
    } else {
      return undefined;
    }
  }

  async findChurchJoinRequests(
    church: ChurchModel,
    dto: GetJoinRequestDto,
    qr?: QueryRunner,
  ): Promise<ChurchJoinModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        churchId: church.id,
        createdAt: this.parseCreatedAt(dto),
        status: dto.status && In(dto.status),
      },
      relations: {
        user: true,
      },
      select: {
        user: {
          name: true,
          mobilePhone: true,
        },
      },
      order: {
        [dto.order]: dto.orderDirection,
      },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });

    /*const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          churchId: church.id,
          createdAt: this.parseCreatedAt(dto),
          status: dto.status && In(dto.status),
        },
        relations: {
          user: true,
        },
        select: {
          user: {
            name: true,
            mobilePhone: true,
          },
        },
        order: {
          [dto.order]: dto.orderDirection,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      repository.count({
        where: {
          churchId: church.id,
          createdAt: this.parseCreatedAt(dto),
          status: dto.status && In(dto.status),
        },
      }),
    ]);

    return new ChurchJoinDomainPaginationResultDto(data, totalCount);*/
  }

  async findChurchJoinRequestById(
    church: ChurchModel,
    joinId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const request = await repository.findOne({
      where: {
        churchId: church.id,
        id: joinId,
      },
      relations: {
        user: true,
      },
    });

    if (!request) {
      throw new NotFoundException(ChurchJoinException.NOT_FOUND);
    }

    return request;
  }

  async updateChurchJoinRequest(
    joinRequest: ChurchJoinModel,
    status: ChurchJoinRequestStatusEnum,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: joinRequest.id,
      },
      {
        status,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchJoinException.UPDATE_ERROR);
    }

    return result;
  }

  async deleteChurchJoinRequest(
    joinRequest: ChurchJoinModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete(joinRequest.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchJoinException.DELETE_ERROR);
    }

    return result;
  }

  async findMyChurchJoinRequest(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchJoinModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        userId: user.id,
      },
      relations: {
        church: true,
      },
      select: {
        church: {
          name: true,
          phone: true,
          address: true,
          detailAddress: true,
        },
      },
      order: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  async findMyChurchJoinRequestById(
    user: UserModel,
    joinId: number,
    qr?: QueryRunner,
  ): Promise<ChurchJoinModel> {
    const repository = this.getRepository(qr);

    const joinRequest = await repository.findOne({
      where: {
        userId: user.id,
        id: joinId,
      },
      relations: {
        church: true,
      },
      select: {
        church: {
          name: true,
          phone: true,
          address: true,
          detailAddress: true,
        },
      },
    });

    if (!joinRequest) {
      throw new NotFoundException(ChurchJoinException.NOT_FOUND);
    }

    return joinRequest;
  }

  async findMyPendingChurchJoinRequest(user: UserModel, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const joinRequest = await repository.findOne({
      where: {
        userId: user.id,
        status: ChurchJoinRequestStatusEnum.PENDING,
      },
    });

    if (!joinRequest) {
      throw new NotFoundException(ChurchJoinException.NOT_FOUND);
    }

    return joinRequest;
  }

  async isExistJoinRequest(user: UserModel, qr: QueryRunner): Promise<boolean> {
    const repository = this.getRepository(qr);

    const joinRequest = await repository.findOne({
      where: {
        user: { id: user.id },
        status: ChurchJoinRequestStatusEnum.PENDING,
      },
    });

    return !!joinRequest;
  }
}
