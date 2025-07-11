import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IOfficersDomainService } from '../interface/officers-domain.service.interface';
import { OfficerModel } from '../../entity/officer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { OfficersException } from '../../const/exception/officers.exception';
import { CreateOfficerDto } from '../../dto/create-officer.dto';
import { UpdateOfficerDto } from '../../dto/update-officer.dto';
import { GetOfficersDto } from '../../dto/request/get-officers.dto';
import { OfficerDomainPaginationResultDto } from '../../dto/officer-domain-pagination-result.dto';
import { OfficerOrderEnum } from '../../const/officer-order.enum';

@Injectable()
export class OfficersDomainService implements IOfficersDomainService {
  constructor(
    @InjectRepository(OfficerModel)
    private readonly officersRepository: Repository<OfficerModel>,
  ) {}

  private getOfficersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(OfficerModel)
      : this.officersRepository;
  }

  async findOfficers(
    church: ChurchModel,
    dto: GetOfficersDto,
    qr?: QueryRunner,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const order: FindOptionsOrder<OfficerModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== OfficerOrderEnum.createdAt) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      officersRepository.find({
        where: {
          churchId: church.id,
        },
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      officersRepository.count({
        where: {
          churchId: church.id,
        },
      }),
    ]);

    return new OfficerDomainPaginationResultDto(data, totalCount);
  }

  async findOfficerById(
    church: ChurchModel,
    officerId: number,
    qr?: QueryRunner,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const officer = await officersRepository.findOne({
      where: {
        churchId: church.id,
        id: officerId,
      },
    });

    if (!officer) {
      throw new NotFoundException();
    }

    return officer;
  }

  async findOfficerModelById(
    church: ChurchModel,
    officerId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerModel>,
  ) {
    const officerRepository = this.getOfficersRepository(qr);

    const officer = await officerRepository.findOne({
      where: {
        churchId: church.id,
        id: officerId,
      },
      relations: {
        ...relationOptions,
      },
    });

    if (!officer) {
      throw new NotFoundException(OfficersException.NOT_FOUND);
    }

    return officer;
  }

  private async isExistOfficer(
    church: ChurchModel,
    name: string,
    qr?: QueryRunner,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const officer = await officersRepository.findOne({
      where: {
        churchId: church.id,
        name,
      },
      withDeleted: true,
    });

    if (officer && officer.deletedAt) {
      await officersRepository.remove(officer);

      return false;
    }

    return !!officer;
  }

  async createOfficer(
    church: ChurchModel,
    dto: CreateOfficerDto,
    qr: QueryRunner,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const existOfficer = await officersRepository.findOne({
      where: {
        churchId: church.id,
        name: dto.name,
      },
      withDeleted: true,
    });

    if (existOfficer) {
      if (existOfficer.deletedAt) {
        await officersRepository.remove(existOfficer);
      } else {
        throw new ConflictException(OfficersException.ALREADY_EXIST);
      }
    }

    return officersRepository.save({
      churchId: church.id,
      ...dto,
    });
  }

  async updateOfficer(
    church: ChurchModel,
    officer: OfficerModel,
    dto: UpdateOfficerDto,
    qr?: QueryRunner,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const isExist = await this.isExistOfficer(church, dto.name, qr);

    if (isExist) {
      throw new ConflictException(OfficersException.ALREADY_EXIST);
    }

    officer.name = dto.name;

    return officersRepository.save(officer);
  }

  async deleteOfficer(officer: OfficerModel, qr?: QueryRunner) {
    const officersRepository = this.getOfficersRepository(qr);

    if (officer.members.length > 0 || officer.membersCount > 0) {
      throw new BadRequestException(OfficersException.HAS_DEPENDENCIES);
    }

    await officersRepository.softDelete({ id: officer.id });

    return;
  }

  async incrementMembersCount(officer: OfficerModel, qr: QueryRunner) {
    const officersRepository = this.getOfficersRepository(qr);

    const result = await officersRepository.increment(
      { id: officer.id, deletedAt: IsNull() },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(OfficersException.NOT_FOUND);
    }

    return true;
  }

  async decrementMembersCount(officer: OfficerModel, qr: QueryRunner) {
    const officersRepository = this.getOfficersRepository(qr);

    const result = await officersRepository.decrement(
      { id: officer.id, deletedAt: IsNull() },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(OfficersException.NOT_FOUND);
    }

    return true;
  }
}
