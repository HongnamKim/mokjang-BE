import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IOfficersDomainService } from '../interface/officers-domain.service.interface';
import { OfficerModel } from '../../entity/officer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  IsNull,
  MoreThan,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { OfficersException } from '../../const/exception/officers.exception';
import { CreateOfficerDto } from '../../dto/request/create-officer.dto';
import { UpdateOfficerNameDto } from '../../dto/request/update-officer-name.dto';
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

  countAllOfficers(church: ChurchModel, qr: QueryRunner): Promise<number> {
    const repository = this.getOfficersRepository(qr);

    return repository.count({
      where: {
        churchId: church.id,
      },
    });
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
    });

    if (existOfficer) {
      throw new ConflictException(OfficersException.ALREADY_EXIST);
    }

    const lastOrderOfficer = await this.officersRepository.find({
      where: {
        churchId: church.id,
      },
      order: {
        order: 'DESC',
      },
      take: 1,
    });

    const order = lastOrderOfficer ? lastOrderOfficer[0].order + 1 : 1;

    return officersRepository.save({
      churchId: church.id,
      ...dto,
      order,
    });
  }

  async updateOfficerStructure(
    church: ChurchModel,
    targetOfficer: OfficerModel,
    order: number,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const officersRepository = this.getOfficersRepository(qr);

    const lastOrderOfficer = await officersRepository.findOne({
      where: {
        churchId: church.id,
      },
      order: {
        order: 'DESC',
      },
    });

    const lastOrder = lastOrderOfficer ? lastOrderOfficer.order : 1;

    if (lastOrder < order) {
      throw new BadRequestException(OfficersException.INVALID_ORDER);
    }

    const isMovingDown = order > targetOfficer.order; // 뒷 순서로 이동하는지
    const range: [number, number] = isMovingDown
      ? [targetOfficer.order + 1, order]
      : [order, targetOfficer.order - 1];

    await officersRepository.update(
      {
        churchId: church.id,
        order: Between(...range),
      },
      {
        order: () => (isMovingDown ? 'order - 1' : 'order + 1'),
      },
    );

    // 수정 대상 직분 순서 변경
    const result = await officersRepository.update(
      {
        id: targetOfficer.id,
      },
      {
        order,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(OfficersException.UPDATE_ERROR);
    }

    return result;
  }

  async updateOfficerName(
    church: ChurchModel,
    officer: OfficerModel,
    dto: UpdateOfficerNameDto,
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

    await officersRepository.update(
      {
        churchId: officer.churchId,
        order: MoreThan(officer.order),
      },
      {
        order: () => 'order + 1',
      },
    );

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
