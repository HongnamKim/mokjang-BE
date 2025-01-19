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
import { GetMinistryDto } from '../../dto/ministry/get-ministry.dto';

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

  getMinistries(churchId: number, dto: GetMinistryDto, qr?: QueryRunner) {
    const ministryRepository = this.getMinistryRepository(qr);

    return ministryRepository.find({
      where: {
        churchId,
        ministryGroupId:
          dto.ministryGroupId === 0 ? IsNull() : dto.ministryGroupId,
      },
      order: {
        [dto.order]: dto.orderDirection,
        id: 'asc',
      },
    });
  }

  async getMinistryModelById(
    churchId: number,
    ministryId: number,
    qr?: QueryRunner,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const ministry = await ministryRepository.findOne({
      where: {
        id: ministryId,
        churchId,
      },
      relations: {
        ministryGroup: true,
      },
    });

    if (!ministry) {
      throw new NotFoundException(MinistryExceptionMessage.NOT_FOUND);
    }

    return ministry;
  }

  async getMinistryById(
    churchId: number,
    ministryId: number,
    qr?: QueryRunner,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const ministry = await ministryRepository.findOne({
      where: {
        churchId,
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
    ministryGroupId: number | null,
    name: string,
    qr?: QueryRunner /*ministryGroupId: number*/,
  ) {
    const ministryRepository = this.getMinistryRepository(qr);

    const ministry = await ministryRepository.findOne({
      where: {
        churchId,
        ministryGroupId: ministryGroupId ? ministryGroupId : IsNull(),
        name: name,
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

    const isExistMinistry = await this.isExistMinistry(
      churchId,
      dto.ministryGroupId,
      dto.name,
      qr,
    );

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
    /*
    이름만 변경하는 경우
      --> 현재 그룹에 변경하고자 하는 이름이 존재하는지

    그룹만 변경하는 경우
      --> 변경하고자 하는 그룹이 존재하는지
      --> 현재 이름이 변경하고자 하는 그룹에 존재하는지

    이름+그룹 변경하는 경우
      --> 변경하고자 하는 그룹이 존재하는지
      --> 변경하고자 하는 그룹에 변경하고자 하는 이름이 존재하는지
     */

    const ministryRepository = this.getMinistryRepository(qr);

    const targetMinistry = await this.getMinistryModelById(
      churchId,
      ministryId,
      qr,
    );

    // dto.ministryGroupId 가 있을 경우(number | 0) --> ministryGroup 변경 dto.ministryGroupId
    // dto.ministryGroupId 가 없을 경우(undefined) --> ministryGroup 유지 targetMinistry.ministryGroupId
    const newMinistryGroupId =
      dto.ministryGroupId === undefined
        ? targetMinistry.ministryGroupId
        : dto.ministryGroupId;

    // 그룹 변경 시 그룹이 있는지 확인
    dto.ministryGroupId
      ? await this.ministryGroupService.getMinistryGroupModelById(
          churchId,
          dto.ministryGroupId,
          qr,
        )
      : undefined;

    // 이름 중복 확인
    const name = dto.name ? dto.name : targetMinistry.name;

    const isExistMinistry = await this.isExistMinistry(
      churchId,
      newMinistryGroupId,
      name,
      qr,
    );

    if (isExistMinistry) {
      throw new BadRequestException(MinistryExceptionMessage.ALREADY_EXIST);
    }

    await ministryRepository.update(
      {
        id: ministryId,
        churchId,
      },
      {
        ministryGroupId: newMinistryGroupId ? newMinistryGroupId : null,
        name: dto.name,
      },
    );

    return ministryRepository.findOne({
      where: {
        id: ministryId,
        churchId,
      },
    });
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
