import { ChurchModel } from '../../../churches/entity/church.entity';
import { CreateChurchEventDto } from '../../dto/request/event/create-church-event.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { ChurchEventModel } from '../../entity/church-event.entity';
import { GetChurchEventsDto } from '../../dto/request/event/get-church-events.dto';
import { UpdateChurchEventDto } from '../../dto/request/event/update-church-event.dto';

export const ICHURCH_EVENT_DOMAIN_SERVICE = Symbol(
  'ICHURCH_EVENT_DOMAIN_SERVICE',
);

export interface IChurchEventDomainService {
  createChurchEvent(
    church: ChurchModel,
    dto: CreateChurchEventDto,
    qr?: QueryRunner,
  ): Promise<ChurchEventModel>;

  findChurchEvents(
    church: ChurchModel,
    dto: GetChurchEventsDto,
    qr?: QueryRunner,
  ): Promise<ChurchEventModel[]>;

  findChurchEventById(
    church: ChurchModel,
    eventId: number,
    qr?: QueryRunner,
  ): Promise<ChurchEventModel>;

  findChurchEventModelById(
    church: ChurchModel,
    eventId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchEventModel>,
  ): Promise<ChurchEventModel>;

  updateChurchEvent(
    event: ChurchEventModel,
    dto: UpdateChurchEventDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteChurchEvent(
    event: ChurchEventModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
