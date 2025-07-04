import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChurchEventService } from '../service/church-event.service';
import { CreateChurchEventDto } from '../dto/request/event/create-church-event.dto';
import { GetChurchEventsDto } from '../dto/request/event/get-church-events.dto';
import { UpdateChurchEventDto } from '../dto/request/event/update-church-event.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Calendar:Events')
@Controller('events')
export class ChurchEventController {
  constructor(private readonly churchEventService: ChurchEventService) {}

  @Get()
  getChurchEvents(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetChurchEventsDto,
  ) {
    return this.churchEventService.getChurchEvents(churchId, dto);
  }

  @Post()
  postChurchEvents(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateChurchEventDto,
  ) {
    return this.churchEventService.postChurchEvent(churchId, dto);
  }

  @Get(':eventId')
  getChurchEventById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.churchEventService.getChurchEventById(churchId, eventId);
  }

  @Patch(':eventId')
  patchChurchEvent(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: UpdateChurchEventDto,
  ) {
    return this.churchEventService.patchChurchEvent(churchId, eventId, dto);
  }

  @Delete(':eventId')
  deleteChurchEvent(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.churchEventService.deleteChurchEvent(churchId, eventId);
  }
}
