import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IChurchEventDomainService } from '../interface/church-event-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ChurchEventModel } from '../../entity/church-event.entity';
import {
  Between,
  FindOptionsRelations,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { CreateChurchEventDto } from '../../dto/request/event/create-church-event.dto';
import { GetChurchEventsDto } from '../../dto/request/event/get-church-events.dto';
import { ChurchEventException } from '../../exception/church-event.exception';
import { UpdateChurchEventDto } from '../../dto/request/event/update-church-event.dto';

@Injectable()
export class ChurchEventDomainService implements IChurchEventDomainService {
  constructor(
    @InjectRepository(ChurchEventModel)
    private readonly churchEventRepository: Repository<ChurchEventModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(ChurchEventModel)
      : this.churchEventRepository;
  }

  async createChurchEvent(
    church: ChurchModel,
    dto: CreateChurchEventDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.save({ ...dto, churchId: church.id });
  }

  async findChurchEventById(
    church: ChurchModel,
    eventId: number,
    qr?: QueryRunner,
  ): Promise<ChurchEventModel> {
    const repository = this.getRepository(qr);

    const event = await repository.findOne({
      where: {
        churchId: church.id,
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException(ChurchEventException.NOT_FOUND);
    }

    return event;
  }

  async findChurchEventModelById(
    church: ChurchModel,
    eventId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchEventModel>,
  ): Promise<ChurchEventModel> {
    const repository = this.getRepository(qr);

    const eventModel = await repository.findOne({
      where: {
        churchId: church.id,
        id: eventId,
      },
      relations: relationOptions,
    });

    if (!eventModel) {
      throw new NotFoundException(ChurchEventException.NOT_FOUND);
    }

    return eventModel;
  }

  findChurchEvents(
    church: ChurchModel,
    dto: GetChurchEventsDto,
    qr?: QueryRunner,
  ): Promise<ChurchEventModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        churchId: church.id,
        date: Between(dto.fromDate, dto.toDate),
      },
      order: { date: 'ASC' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        title: true,
        date: true,
      },
    });
  }

  async updateChurchEvent(
    event: ChurchEventModel,
    dto: UpdateChurchEventDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update({ id: event.id }, { ...dto });

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchEventException.UPDATE_ERROR);
    }

    return result;
  }

  async deleteChurchEvent(
    event: ChurchEventModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete({ id: event.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(ChurchEventException.DELETE_ERROR);
    }

    return result;
  }
}
