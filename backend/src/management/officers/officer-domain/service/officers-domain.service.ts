import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IOfficersDomainService } from '../interface/officers-domain.service.interface';
import { OfficerModel } from '../../entity/officer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { OfficersException } from '../../const/exception/officers.exception';
import { CreateOfficerDto } from '../../dto/create-officer.dto';
import { UpdateOfficerDto } from '../../dto/update-officer.dto';

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

  findOfficers(church: ChurchModel, qr?: QueryRunner) {
    const officersRepository = this.getOfficersRepository(qr);

    return officersRepository.find({
      where: {
        churchId: church.id,
      },
    });
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
    });

    return !!officer;
  }

  async createOfficer(
    church: ChurchModel,
    dto: CreateOfficerDto,
    qr: QueryRunner,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const isExist = await this.isExistOfficer(church, dto.name, qr);

    if (isExist) {
      throw new BadRequestException(OfficersException.ALREADY_EXIST);
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

    const result = await officersRepository.update(
      { id: officer.id, deletedAt: IsNull() },
      {
        name: dto.name,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(OfficersException.NOT_FOUND);
    }

    return this.findOfficerById(church, officer.id, qr);
  }

  async deleteOfficer(officer: OfficerModel, qr?: QueryRunner) {
    const officersRepository = this.getOfficersRepository(qr);

    await officersRepository.softDelete({ id: officer.id });

    return `officerId ${officer.id} deleted`;
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
