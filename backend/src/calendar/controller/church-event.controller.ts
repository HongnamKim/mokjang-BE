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
  UseGuards,
} from '@nestjs/common';
import { ChurchEventService } from '../service/church-event.service';
import { CreateChurchEventDto } from '../dto/request/event/create-church-event.dto';
import { GetChurchEventsDto } from '../dto/request/event/get-church-events.dto';
import { UpdateChurchEventDto } from '../dto/request/event/update-church-event.dto';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';

@ApiTags('Calendar:Events')
@Controller('events')
export class ChurchEventController {
  constructor(private readonly churchEventService: ChurchEventService) {}

  @Get()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getChurchEvents(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetChurchEventsDto,
  ) {
    return this.churchEventService.getChurchEvents(church, dto);
  }

  @Post()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  postChurchEvents(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: CreateChurchEventDto,
  ) {
    return this.churchEventService.postChurchEvent(church, dto);
  }

  @Get(':eventId')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getChurchEventById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.churchEventService.getChurchEventById(church, eventId);
  }

  @Patch(':eventId')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  patchChurchEvent(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: UpdateChurchEventDto,
  ) {
    return this.churchEventService.patchChurchEvent(church, eventId, dto);
  }

  @Delete(':eventId')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  deleteChurchEvent(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.churchEventService.deleteChurchEvent(church, eventId);
  }
}
