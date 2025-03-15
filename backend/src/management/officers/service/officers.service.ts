import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfficerModel } from '../entity/officer.entity';
import { FindOptionsRelations, QueryRunner, Repository } from 'typeorm';
import { MANAGEMENT_EXCEPTION } from '../../exception-messages/exception-messages.const';
import { CreateOfficerDto } from '../dto/create-officer.dto';
import { UpdateOfficerDto } from '../dto/update-officer.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IOFFICERS_DOMAIN_SERVICE,
  IOfficersDomainService,
} from '../officer-domain/interface/officers-domain.service.interface';

@Injectable()
export class OfficersService {
  constructor(
    @InjectRepository(OfficerModel)
    private readonly officersRepository: Repository<OfficerModel>,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IOFFICERS_DOMAIN_SERVICE)
    private readonly officersDomainService: IOfficersDomainService,
  ) {}

  private getOfficersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(OfficerModel)
      : this.officersRepository;
  }

  private async checkChurchExist(churchId: number) {
    const isExistChurch =
      await this.churchesDomainService.isExistChurch(churchId);

    if (!isExistChurch) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }
  }

  private async isExistOfficer(
    churchId: number,
    name: string,
    qr?: QueryRunner,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const officer = await officersRepository.findOne({
      where: {
        churchId,
        name,
      },
    });

    return !!officer;
  }

  async getOfficers(churchId: number, qr?: QueryRunner) {
    const officersRepository = this.getOfficersRepository(qr);

    return officersRepository.find({
      where: {
        churchId,
      },
    });
  }

  async getOfficerById(churchId: number, officerId: number, qr?: QueryRunner) {
    const officersRepository = this.getOfficersRepository(qr);

    const officer = await officersRepository.findOne({
      where: {
        churchId,
        id: officerId,
      },
    });

    if (!officer) {
      throw new NotFoundException(MANAGEMENT_EXCEPTION.OfficerModel.NOT_FOUND);
    }

    return officer;
  }

  async getOfficerModelById(
    churchId: number,
    officerId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerModel>,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const officer = await officersRepository.findOne({
      where: {
        churchId,
        id: officerId,
      },
      relations: {
        ...relationOptions,
      },
    });

    if (!officer) {
      throw new NotFoundException(MANAGEMENT_EXCEPTION.OfficerModel.NOT_FOUND);
    }

    return officer;
  }

  async createOfficer(
    churchId: number,
    dto: CreateOfficerDto,
    qr: QueryRunner,
  ) {
    await this.checkChurchExist(churchId);

    const officersRepository = this.getOfficersRepository(qr);

    const existingOfficer = await officersRepository.findOne({
      where: {
        churchId,
        name: dto.name,
      },
      relations: { members: true },
      withDeleted: true,
    });

    if (existingOfficer) {
      if (!existingOfficer.deletedAt) {
        throw new BadRequestException(
          MANAGEMENT_EXCEPTION.OfficerModel.ALREADY_EXIST,
        );
      }

      await officersRepository.remove(existingOfficer);
    }

    /*const isExist = await this.isExistOfficer(churchId, dto.name, qr);

    if (isExist) {
      throw new BadRequestException(
        MANAGEMENT_EXCEPTION.OfficerModel.ALREADY_EXIST,
      );
    }*/

    const result = await officersRepository.insert({
      name: dto.name,
      churchId,
    });

    return this.getOfficerModelById(churchId, result.identifiers[0].id, qr);
  }

  async updateOfficer(
    churchId: number,
    officerId: number,
    dto: UpdateOfficerDto,
    qr?: QueryRunner,
  ) {
    const isExist = await this.isExistOfficer(churchId, dto.name, qr);

    if (isExist) {
      throw new BadRequestException(
        MANAGEMENT_EXCEPTION.OfficerModel.ALREADY_EXIST,
      );
    }

    const officersRepository = this.getOfficersRepository(qr);

    const result = await officersRepository.update(
      {
        id: officerId,
        churchId,
      },
      { name: dto.name },
    );

    if (result.affected === 0) {
      throw new NotFoundException(MANAGEMENT_EXCEPTION.OfficerModel.NOT_FOUND);
    }

    return this.getOfficerById(churchId, officerId, qr);
  }

  async deleteOfficer(churchId: number, officerId: number, qr?: QueryRunner) {
    const targetOfficer = await this.getOfficerModelById(
      churchId,
      officerId,
      qr,
      { members: true },
    );

    const officersRepository = this.getOfficersRepository(qr);

    await officersRepository.softRemove(targetOfficer);

    return 'officerId ${officerId} deleted';
  }

  async incrementMembersCount(
    churchId: number,
    officerId: number,
    qr: QueryRunner,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const result = await officersRepository.increment(
      { id: officerId, churchId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MANAGEMENT_EXCEPTION.OfficerModel.NOT_FOUND);
    }

    return true;
  }

  async decrementMembersCount(
    churchId: number,
    officerId: number,
    qr: QueryRunner,
  ) {
    const officersRepository = this.getOfficersRepository(qr);

    const result = await officersRepository.decrement(
      { id: officerId, churchId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(MANAGEMENT_EXCEPTION.OfficerModel.NOT_FOUND);
    }

    return true;
  }
}
