import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IChurchJoinRequestDomainService } from '../interface/church-join-requests-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ChurchJoinRequestModel } from '../../entity/church-join-request.entity';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../entity/church.entity';
import { UserModel } from '../../../user/entity/user.entity';
import { ChurchJoinRequestStatusEnum } from '../../const/church-join-request-status.enum';
import { ChurchJoinRequestException } from '../../const/exception/church.exception';
import { GetJoinRequestDto } from '../../dto/church-join-request/get-join-request.dto';

@Injectable()
export class ChurchJoinRequestsDomainService
  implements IChurchJoinRequestDomainService
{
  constructor(
    @InjectRepository(ChurchJoinRequestModel)
    private readonly churchJoinRequestsRepository: Repository<ChurchJoinRequestModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(ChurchJoinRequestModel)
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
      throw new BadRequestException(ChurchJoinRequestException.ALREADY_EXIST);
    }

    return true;
  }

  async createChurchJoinRequest(
    church: ChurchModel,
    user: UserModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const newRequest = await repository.save({
      church,
      user,
      status: ChurchJoinRequestStatusEnum.PENDING,
    });

    return this.findMyChurchJoinRequestById(user, newRequest.id, qr);
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
  ): Promise<{ data: ChurchJoinRequestModel[]; totalCount: number }> {
    const repository = this.getRepository(qr);

    const [data, totalCount] = await Promise.all([
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

    return { data, totalCount };
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
      throw new NotFoundException(ChurchJoinRequestException.NOT_FOUND);
    }

    return request;
  }

  async updateChurchJoinRequest(
    joinRequest: ChurchJoinRequestModel,
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
      throw new InternalServerErrorException(
        ChurchJoinRequestException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteChurchJoinRequest(
    joinRequest: ChurchJoinRequestModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete(joinRequest.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        ChurchJoinRequestException.DELETE_ERROR,
      );
    }

    return result;
  }

  async findMyChurchJoinRequest(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchJoinRequestModel[]> {
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
  ): Promise<ChurchJoinRequestModel> {
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
      throw new NotFoundException(ChurchJoinRequestException.NOT_FOUND);
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
      throw new NotFoundException(ChurchJoinRequestException.NOT_FOUND);
    }

    return joinRequest;
  }
}
