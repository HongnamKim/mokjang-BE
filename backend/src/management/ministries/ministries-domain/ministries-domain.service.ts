import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IMinistriesDomainService } from './interface/ministries-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryModel } from '../entity/ministry.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetMinistryDto } from '../dto/get-ministry.dto';
import { MinistryException } from '../const/ministry.exception';
import { CreateMinistryDto } from '../dto/create-ministry.dto';
import { MinistryGroupModel } from '../entity/ministry-group.entity';
import { UpdateMinistryDto } from '../dto/update-ministry.dto';
import { OfficersException } from '../../officers/const/exception/officers.exception';

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
    });

    return !!ministry;
  }

  async findMinistries(
    church: ChurchModel,
    dto: GetMinistryDto,
    qr?: QueryRunner,
  ) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    return ministriesRepository.find({
      where: {
        churchId: church.id,
        ministryGroupId:
          dto.ministryGroupId === 0 ? IsNull() : dto.ministryGroupId,
      },
      order: {
        [dto.order]: dto.orderDirection,
        id: 'asc',
      },
    });
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
        members: true,
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
      throw new BadRequestException(MinistryException.ALREADY_EXIST);
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

    return `ministryId ${ministry.id} deleted`;
  }

  async incrementMembersCount(ministry: MinistryModel, qr: QueryRunner) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const result = await ministriesRepository.increment(
      { id: ministry.id, deletedAt: IsNull() },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return true;
  }

  async decrementMembersCount(ministry: MinistryModel, qr: QueryRunner) {
    const ministriesRepository = this.getMinistriesRepository(qr);

    const result = await ministriesRepository.decrement(
      { id: ministry.id, deletedAt: IsNull() },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryException.NOT_FOUND);
    }

    return true;
  }
}
