import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IChurchJoinRequestDomainService } from './interface/church-join-requests-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ChurchJoinRequestModel } from '../entity/church-join-request.entity';
import { QueryRunner, Repository, UpdateResult } from 'typeorm';
import { ChurchModel } from '../entity/church.entity';
import { UserModel } from '../../user/entity/user.entity';
import { ChurchJoinRequestStatusEnum } from '../const/church-join-request-status.enum';
import { ChurchJoinRequestException } from '../const/exception/church.exception';

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

  createChurchJoinRequest(
    church: ChurchModel,
    user: UserModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.save({
      church,
      user,
      status: ChurchJoinRequestStatusEnum.PENDING,
    });
  }

  findChurchJoinRequests(
    church: ChurchModel,
    qr?: QueryRunner,
  ): Promise<ChurchJoinRequestModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        churchId: church.id,
      },
      relations: {
        user: true,
      },
    });
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
}
