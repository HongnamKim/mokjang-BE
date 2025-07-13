import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMinistriesDomainService } from '../interface/ministries-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MinistryModel,
  MinistryModelColumns,
} from '../../entity/ministry.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { GetMinistryDto } from '../../dto/ministry/get-ministry.dto';
import { MinistryException } from '../../const/exception/ministry.exception';
import { CreateMinistryDto } from '../../dto/ministry/create-ministry.dto';
import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import { UpdateMinistryDto } from '../../dto/ministry/update-ministry.dto';
import { OfficersException } from '../../../officers/const/exception/officers.exception';
import { MinistryDomainPaginationResponseDto } from '../../dto/ministry/response/ministry-domain-pagination-response.dto';
import { MinistryOrderEnum } from '../../const/ministry-order.enum';

@Injectable()
export class MinistriesDomainService implements IMinistriesDomainService {
  constructor(
    @InjectRepository(MinistryModel)
    private readonly ministriesRepository: Repository<MinistryModel>,
  ) {}

  private getMinistriesRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryModel)
      : this.ministriesRepository;
  }

  private async isExistMinistry(
    churchId: number,
    ministryGroup: MinistryGroupModel | null,
    name: string,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const ministry = await ministriesRepository.findOne({
      where: {
        churchId,
        ministryGroupId: ministryGroup === null ? IsNull() : ministryGroup.id,
        name,
      },
      withDeleted: true,
    });

    // soft-deleted 된 사역일 경우 완전 삭제
    if (ministry && ministry.deletedAt) {
      await ministriesRepository.remove(ministry);

      return false;
    }

    return !!ministry;
  }

  countAllMinistries(church: ChurchModel, qr: QueryRunner): Promise<number> {
    const repository = this.getMinistriesRepository(qr);

    return repository.count({
      where: {
        churchId: church.id,
      },
    });
  }

  async findMinistries(
    church: ChurchModel,
    dto: GetMinistryDto,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const order: FindOptionsOrder<MinistryModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== MinistryOrderEnum.createdAt) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      ministriesRepository.find({
        where: {
          churchId: church.id,
          ministryGroupId:
            dto.ministryGroupId === 0 ? IsNull() : dto.ministryGroupId,
        },
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),

      ministriesRepository.count({
        where: {
          churchId: church.id,
          ministryGroupId:
            dto.ministryGroupId === 0 ? IsNull() : dto.ministryGroupId,
        },
      }),
    ]);

    return new MinistryDomainPaginationResponseDto(data, totalCount);
  }

  async findMinistryModelById(
    church: ChurchModel,
    ministryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryModel>,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const ministry = await ministriesRepository.findOne({
      where: {
        id: ministryId,
        churchId: church.id,
      },
      relations: relationOptions ? relationOptions : { ministryGroup: true },
    });

    if (!ministry) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return ministry;
  }

  async findMinistryById(
    church: ChurchModel,
    ministryId: number,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const ministry = await ministriesRepository.findOne({
      where: {
        churchId: church.id,
        id: ministryId,
      },
      relations: {
        //members: true,
      },
    });

    if (!ministry) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return ministry;
  }

  async createMinistry(
    church: ChurchModel,
    dto: CreateMinistryDto,
    ministryGroup: MinistryGroupModel | null,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const isExistMinistry = await this.isExistMinistry(
      church.id,
      ministryGroup,
      dto.name,
      qr,
    );

    if (isExistMinistry) {
      throw new ConflictException(MinistryException.ALREADY_EXIST);
    }

    return ministriesRepository.save({
      name: dto.name,
      churchId: church.id,
      ministryGroup: ministryGroup ? ministryGroup : undefined,
    });
  }

  async updateMinistry(
    church: ChurchModel,
    targetMinistry: MinistryModel,
    dto: UpdateMinistryDto,
    qr: QueryRunner,
    newMinistryGroup: MinistryGroupModel | null,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const newName = dto.name ? dto.name : targetMinistry.name;

    const isExist = await this.isExistMinistry(
      church.id,
      newMinistryGroup,
      newName,
      qr,
    );

    if (isExist) {
      throw new BadRequestException(MinistryException.ALREADY_EXIST);
    }

    const result = await ministriesRepository.update(
      {
        id: targetMinistry.id,
        deletedAt: IsNull(),
      },
      {
        name: dto.name,
        ministryGroupId: newMinistryGroup === null ? null : newMinistryGroup.id,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return this.findMinistryById(church, targetMinistry.id, qr);
  }

  async deleteMinistry(ministry: MinistryModel, qr?: QueryRunner) {
    if (ministry.membersCount !== 0) {
      throw new BadRequestException(OfficersException.HAS_DEPENDENCIES);
    }

    const ministriesRepository = this.getMinistriesRepository(qr);

    const result = await ministriesRepository.softDelete({
      id: ministry.id,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return;
  }

  async incrementMembersCount(ministry: MinistryModel, qr: QueryRunner) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const result = await ministriesRepository.increment(
      { id: ministry.id, deletedAt: IsNull() },
      MinistryModelColumns.membersCount,
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return true;
  }

  async decrementMembersCount(ministry: MinistryModel, qr: QueryRunner) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    if (ministry.membersCount === 0) {
      throw new ConflictException(MinistryException.EMPTY_MEMBER_COUNT);
    }

    const result = await ministriesRepository.decrement(
      { id: ministry.id, deletedAt: IsNull() },
      MinistryModelColumns.membersCount,
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return true;
  }

  async refreshMembersCount(
    ministry: MinistryModel,
    membersCount: number,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const updatedMinistry = await ministriesRepository.preload({
      id: ministry.id,
      membersCount: membersCount,
    });

    if (!updatedMinistry) {
      throw new InternalServerErrorException(MinistryException.UPDATE_ERROR);
    }

    return updatedMinistry;
  }
}
