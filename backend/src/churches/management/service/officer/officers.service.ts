import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfficerModel } from '../../entity/officer/officer.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { ChurchesService } from '../../../churches.service';
import { MANAGEMENT_EXCEPTION } from '../../exception-messages/exception-messages.const';
import { CreateOfficerDto } from '../../dto/officer/create-officer.dto';
import { UpdateOfficerDto } from '../../dto/officer/update-officer.dto';

@Injectable()
export class OfficersService {
  constructor(
    @InjectRepository(OfficerModel)
    private readonly officersRepository: Repository<OfficerModel>,
    private readonly churchesService: ChurchesService,
  ) {}

  private getOfficersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(OfficerModel)
      : this.officersRepository;
  }

  private async checkChurchExist(churchId: number) {
    const isExistChurch = await this.churchesService.isExistChurch(churchId);

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

  async postOfficer(churchId: number, dto: CreateOfficerDto, qr?: QueryRunner) {
    await this.checkChurchExist(churchId);

    const isExist = await this.isExistOfficer(churchId, dto.name, qr);

    if (isExist) {
      throw new BadRequestException(
        MANAGEMENT_EXCEPTION.OfficerModel.ALREADY_EXIST,
      );
    }

    const officersRepository = this.getOfficersRepository(qr);

    return officersRepository.save({ name: dto.name, churchId });
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

    if (
      targetOfficer.members.length !== 0 ||
      targetOfficer.membersCount !== 0
    ) {
      throw new BadRequestException('해당 직분을 갖고 있는 교인이 존재합니다.');
    }

    const officersRepository = this.getOfficersRepository(qr);

    const result = await officersRepository.softDelete({
      id: officerId,
      churchId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(MANAGEMENT_EXCEPTION.OfficerModel.NOT_FOUND);
    }

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
