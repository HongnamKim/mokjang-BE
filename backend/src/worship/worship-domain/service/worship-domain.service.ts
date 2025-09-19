import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IWorshipDomainService } from '../interface/worship-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipModel } from '../../entity/worship.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  MoreThan,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetWorshipsDto } from '../../dto/request/worship/get-worships.dto';
import { WorshipOrderEnum } from '../../const/worship-order.enum';
import { WorshipException } from '../../exception/worship.exception';
import { CreateWorshipDto } from '../../dto/request/worship/create-worship.dto';
import { UpdateWorshipDto } from '../../dto/request/worship/update-worship.dto';
import { MemberModel } from '../../../members/entity/member.entity';

@Injectable()
export class WorshipDomainService implements IWorshipDomainService {
  constructor(
    @InjectRepository(WorshipModel)
    private readonly repository: Repository<WorshipModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(WorshipModel) : this.repository;
  }

  countAllWorships(church: ChurchModel, qr: QueryRunner): Promise<number> {
    const repository = this.getRepository(qr);

    return repository.count({
      where: {
        churchId: church.id,
      },
    });
  }

  async findWorships(
    church: ChurchModel,
    dto: GetWorshipsDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const orderOptions: FindOptionsOrder<WorshipModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== WorshipOrderEnum.CREATED_AT) {
      orderOptions.createdAt = 'ASC';
    }

    return repository.find({
      where: {
        churchId: church.id,
      },
      relations: {
        worshipTargetGroups: {
          group: true,
        },
      },
      select: {
        worshipTargetGroups: {
          id: true,
          group: {
            id: true,
            name: true,
          },
        },
      },
      order: orderOptions,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
    /*const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          churchId: church.id,
        },
        relations: {
          worshipTargetGroups: {
            group: true,
          },
        },
        select: {
          worshipTargetGroups: {
            id: true,
            group: {
              id: true,
              name: true,
            },
          },
        },
        order: orderOptions,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),

      repository.count({
        where: {
          churchId: church.id,
        },
      }),
    ]);

    return new WorshipDomainPaginationResultDto(data, totalCount);
    */
  }

  async findAllWorships(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<WorshipModel[]> {
    const repository = this.getRepository(qr);

    const qb = repository
      .createQueryBuilder('worship')
      .where('worship.churchId = :churchId', { churchId: church.id })
      .select(['worship.id']);

    return qb.getMany();
  }

  async findWorshipById(
    church: ChurchModel,
    worshipId: number,
    qr?: QueryRunner,
  ): Promise<WorshipModel> {
    const repository = this.getRepository(qr);

    const worship = await repository.findOne({
      where: {
        churchId: church.id,
        id: worshipId,
      },
      relations: {
        worshipTargetGroups: {
          group: true,
        },
      },
      select: {
        worshipTargetGroups: {
          id: true,
          group: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!worship) {
      throw new NotFoundException(WorshipException.NOT_FOUND);
    }

    return worship;
  }

  async findWorshipModelById(
    church: ChurchModel,
    worshipId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<WorshipModel>,
  ): Promise<WorshipModel> {
    const repository = this.getRepository(qr);

    const worship = await repository.findOne({
      where: {
        churchId: church.id,
        id: worshipId,
      },
      relations: relationOptions,
    });

    if (!worship) {
      throw new NotFoundException(WorshipException.NOT_FOUND);
    }

    return worship;
  }

  private async assertValidWorshipTitle(
    church: ChurchModel,
    title: string,
    repository: Repository<WorshipModel>,
  ) {
    const existWorship = await repository.findOne({
      where: {
        churchId: church.id,
        title: title,
      },
    });

    if (existWorship) {
      throw new ConflictException(WorshipException.ALREADY_EXIST);
    }

    return true;
  }

  async createWorship(
    church: ChurchModel,
    dto: CreateWorshipDto,
    qr: QueryRunner,
  ): Promise<WorshipModel> {
    const repository = this.getRepository(qr);

    await this.assertValidWorshipTitle(church, dto.title, repository);

    return repository.save({
      churchId: church.id,
      title: dto.title,
      description: dto.description,
      worshipDay: dto.worshipDay,
      repeatPeriod: dto.repeatPeriod,
    });
  }

  async updateWorship(
    church: ChurchModel,
    targetWorship: WorshipModel,
    dto: UpdateWorshipDto,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    if (dto.title) {
      await this.assertValidWorshipTitle(church, dto.title, repository);
    }

    const result = await repository.update(
      { id: targetWorship.id },
      {
        title: dto.title,
        description: dto.description,
        worshipDay: dto.worshipDay,
        repeatPeriod: dto.repeatPeriod,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(WorshipException.UPDATE_ERROR);
    }

    return result;
  }

  async deleteWorship(
    targetWorship: WorshipModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete({ id: targetWorship.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(WorshipException.DELETE_ERROR);
    }

    return result;
  }

  async findAvailableWorships(
    member: MemberModel,
    targetGroupIds: number[] | undefined,
  ): Promise<WorshipModel[]> {
    const repository = this.getRepository();

    const query = repository
      .createQueryBuilder('worship')
      .leftJoin('worship.worshipTargetGroups', 'target')
      .innerJoin(
        'worship.worshipEnrollments',
        'enrollment',
        'enrollment.memberId = :memberId',
        { memberId: member.id },
      )
      .select(['worship.id', 'worship.title', 'worship.worshipDay'])
      .orderBy('worship.worshipDay', 'ASC')
      .addOrderBy('worship.id', 'ASC');

    if (targetGroupIds && targetGroupIds.length > 0) {
      query.andWhere(
        '(target.groupId IN (:...groupIds) OR target.id IS NULL)',
        {
          groupIds: targetGroupIds,
        },
      );
    } else {
      query.andWhere('target.id IS NULL');
    }

    return query.getMany();
  }

  findBulkWorshipByDay(
    targetWorshipDay: number,
    bulkSize: number,
    cursor: number,
  ): Promise<WorshipModel[]> {
    const repository = this.getRepository();

    return repository.find({
      where: {
        worshipDay: targetWorshipDay,
        id: cursor > 0 ? MoreThan(cursor) : undefined,
      },
      select: {
        id: true,
        churchId: true,
        title: true,
      },
      order: {
        id: 'ASC',
      },
      take: bulkSize,
    });
  }
}
