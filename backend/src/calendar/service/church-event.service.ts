import { Inject, Injectable } from '@nestjs/common';
import { CreateChurchEventDto } from '../dto/request/event/create-church-event.dto';
import {
  ICHURCH_EVENT_DOMAIN_SERVICE,
  IChurchEventDomainService,
} from '../calendar-domain/interface/church-event-domain.service.interface';
import { PostChurchEventResponseDto } from '../dto/response/event/post-church-event-response.dto';
import { GetChurchEventsDto } from '../dto/request/event/get-church-events.dto';
import { GetChurchEventResponseDto } from '../dto/response/event/get-church-event-response.dto';
import { UpdateChurchEventDto } from '../dto/request/event/update-church-event.dto';
import { PatchChurchEventResponseDto } from '../dto/response/event/patch-church-event-response.dto';
import { DeleteChurchEventResponseDto } from '../dto/response/event/delete-church-event-response.dto';
import { ChurchModel } from '../../churches/entity/church.entity';

@Injectable()
export class ChurchEventService {
  constructor(
    @Inject(ICHURCH_EVENT_DOMAIN_SERVICE)
    private readonly churchEventDomainService: IChurchEventDomainService,
  ) {}

  async getChurchEvents(church: ChurchModel, dto: GetChurchEventsDto) {
    const events = await this.churchEventDomainService.findChurchEvents(
      church,
      dto,
    );

    return new GetChurchEventResponseDto(events);
  }

  async postChurchEvent(church: ChurchModel, dto: CreateChurchEventDto) {
    const newChurchEvent =
      await this.churchEventDomainService.createChurchEvent(church, dto);

    return new PostChurchEventResponseDto(newChurchEvent);
  }

  async getChurchEventById(church: ChurchModel, eventId: number) {
    const event = await this.churchEventDomainService.findChurchEventById(
      church,
      eventId,
    );

    return new GetChurchEventResponseDto(event);
  }

  async patchChurchEvent(
    church: ChurchModel,
    eventId: number,
    dto: UpdateChurchEventDto,
  ) {
    const event = await this.churchEventDomainService.findChurchEventModelById(
      church,
      eventId,
    );

    await this.churchEventDomainService.updateChurchEvent(event, dto);

    const updatedEvent =
      await this.churchEventDomainService.findChurchEventById(church, event.id);

    return new PatchChurchEventResponseDto(updatedEvent);
  }

  async deleteChurchEvent(church: ChurchModel, eventId: number) {
    const event = await this.churchEventDomainService.findChurchEventModelById(
      church,
      eventId,
    );

    await this.churchEventDomainService.deleteChurchEvent(event);

    return new DeleteChurchEventResponseDto(
      new Date(),
      event.id,
      event.title,
      true,
    );
  }
}
