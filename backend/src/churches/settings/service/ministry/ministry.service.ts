import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryModel } from '../../entity/ministry/ministry.entity';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { CreateMinistryDto } from '../../dto/ministry/create-ministry.dto';
import { UpdateMinistryDto } from '../../dto/ministry/update-ministry.dto';
import { MinistryExceptionMessage } from '../../const/exception/ministry/ministry.exception';
import { MinistryGroupService } from './ministry-group.service';

@Injectable()
export class MinistryService {
  constructor(
    @InjectRepository(MinistryModel)
    private readonly ministryRepository: Repository<MinistryModel>,
    private readonly ministryGroupService: MinistryGroupService,
  ) {}

  private getMinistryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryModel)
      : this.ministryRepository;
  }

  getMinistries(churchId: number, qr?: QueryRunner) {
    const ministryRepository = this.getMinistryRepository(qr);

    return ministryRepository.find({
      where: {
        churchId,
      },
    });
  }

  async getMinistryById(ministryId: number, qr?: QueryRunner) {
    const ministryRepository = this.getMinistryRepository(qr);

    const ministry = await ministryRepository.findOne({
      where: {
        id: ministryId,
      },
      relations: {
        members: true,
      },
    });

    if (!ministry) {
      throw new NotFoundException(MinistryExceptionMessage.NOT_FOUND);
    }

    return ministry;
  }

  async isExistMinistry(
    churchId: number,
    name: string,
    qr?: QueryRunner /*ministryGroupId: number*/,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const ministry = await ministryRepository.findOne({
      where: {
        name: name,
        churchId,
        /*ministryGroupId: ministryGroupId*/
      },
    });

    return !!ministry;
  }

  async createMinistry(
    churchId: number,
    dto: CreateMinistryDto,
    qr?: QueryRunner,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const isExistMinistry = await this.isExistMinistry(churchId, dto.name, qr);
    if (isExistMinistry) {
      throw new BadRequestException(MinistryExceptionMessage.ALREADY_EXIST);
    }

    const ministryGroup = dto.ministryGroupId
      ? await this.ministryGroupService.getMinistryGroupModelById(
          churchId,
          dto.ministryGroupId,
          qr,
        )
      : undefined;

    const newMinistry = await ministryRepository.save({
      name: dto.name,
      churchId: churchId,
      ministryGroup,
    });

    return ministryRepository.findOne({
      where: {
        id: newMinistry.id,
      },
      relations: {
        ministryGroup: true,
      },
    });
  }

  async updateMinistry(
    churchId: number,
    ministryId: number,
    dto: UpdateMinistryDto,
    qr?: QueryRunner,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    // 이름 변경 시 중복 확인
    if (dto.name) {
      const isExistMinistry = await this.isExistMinistry(
        churchId,
        dto.name,
        qr,
      );

      if (isExistMinistry) {
        throw new BadRequestException(MinistryExceptionMessage.ALREADY_EXIST);
      }
    }

    // 사역 그룹
    const ministryGroup = dto.ministryGroupId
      ? await this.ministryGroupService.getMinistryGroupModelById(
          churchId,
          dto.ministryGroupId,
          qr,
        )
      : undefined;

    const result = await ministryRepository.update(
      {
        id: ministryId,
        churchId,
      },
      {
        name: dto.name,
        ministryGroupId: ministryGroup?.id,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryExceptionMessage.NOT_FOUND);
    }

    return this.getMinistryById(ministryId);
  }

  async deleteMinistry(churchId: number, ministryId: number, qr?: QueryRunner) {
    const ministryRepository = this.getMinistryRepository(qr);

    const result = await ministryRepository.softDelete({
      id: ministryId,
      churchId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(MinistryExceptionMessage.NOT_FOUND);
    }

    return `ministryId ${ministryId} deleted`;
  }

  async incrementMembersCount(
    churchId: number,
    ministryId: number,
    qr: QueryRunner,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const result = await ministryRepository.increment(
      { id: ministryId, churchId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryExceptionMessage.NOT_FOUND);
    }

    return true;
  }

  async decrementMembersCount(
    churchId: number,
    ministryId: number,
    qr: QueryRunner,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const result = await ministryRepository.decrement(
      { id: ministryId, churchId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryExceptionMessage.NOT_FOUND);
    }

    return true;
  }
}
