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
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorshipSessionService } from '../service/worship-session.service';
import { CreateWorshipSessionDto } from '../dto/request/worship-session/create-worship-session.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { GetWorshipSessionsDto } from '../dto/request/worship-session/get-worship-sessions.dto';
import { UpdateWorshipSessionDto } from '../dto/request/worship-session/update-worship-session.dto';

@ApiTags('Worships:Sessions')
@Controller(':worshipId/sessions')
export class WorshipSessionController {
  constructor(private readonly worshipSessionService: WorshipSessionService) {}

  @Get()
  getSessions(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Query() dto: GetWorshipSessionsDto,
  ) {
    return this.worshipSessionService.getWorshipSessions(
      churchId,
      worshipId,
      dto,
    );
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Body() dto: CreateWorshipSessionDto,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipSessionService.postWorshipSession(
      churchId,
      worshipId,
      dto,
      qr,
    );
  }

  @Post('recent')
  @UseInterceptors(TransactionInterceptor)
  getOrPostRecentSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipSessionService.getOrPostRecentSession(
      churchId,
      worshipId,
      qr,
    );
  }

  @Get(':sessionId')
  getSessionById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.worshipSessionService.getSessionById(
      churchId,
      worshipId,
      sessionId,
    );
  }

  @Patch(':sessionId')
  @UseInterceptors(TransactionInterceptor)
  patchSessionById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: UpdateWorshipSessionDto,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipSessionService.patchWorshipSessionById(
      churchId,
      worshipId,
      sessionId,
      dto,
      qr,
    );
  }

  @Delete(':sessionId')
  deleteSessionById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.worshipSessionService.deleteWorshipSessionById(
      churchId,
      worshipId,
      sessionId,
    );
  }
}
