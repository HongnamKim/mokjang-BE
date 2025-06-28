import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorshipSessionService } from '../service/worship-session.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { GetWorshipSessionsDto } from '../dto/request/worship-session/get-worship-sessions.dto';
import { UpdateWorshipSessionDto } from '../dto/request/worship-session/update-worship-session.dto';
import { ParseDatePipe } from '../pipe/parse-date.pipe';
import {
  ApiDeleteSession,
  ApiGetOrPostRecentSession,
  ApiGetOrPostSessionByDate,
  ApiGetSessionById,
  ApiGetSessions,
  ApiPatchSession,
  ApiPostSessionManual,
} from '../swagger/worship-session.swagger';
import { CreateWorshipSessionDto } from '../dto/request/worship-session/create-worship-session.dto';
import { WorshipReadGuard } from '../guard/worship-read.guard';
import { WorshipWriteGuard } from '../guard/worship-write.guard';

@ApiTags('Worships:Sessions')
@Controller(':worshipId/sessions')
export class WorshipSessionController {
  constructor(private readonly worshipSessionService: WorshipSessionService) {}

  @ApiGetSessions()
  @Get()
  @WorshipReadGuard()
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

  @ApiGetOrPostSessionByDate()
  @Post()
  @WorshipReadGuard()
  @UseInterceptors(TransactionInterceptor)
  getOrPostSessionByDate(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Query('sessionDate', ParseDatePipe) sessionDate: Date,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipSessionService.getOrPostWorshipSessionByDate(
      churchId,
      worshipId,
      sessionDate,
      qr,
    );
  }

  @ApiGetOrPostRecentSession()
  @Post('recent')
  @WorshipReadGuard()
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

  @ApiPostSessionManual()
  @Post('manual')
  @WorshipWriteGuard()
  postSessionManual(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Body() dto: CreateWorshipSessionDto,
  ) {
    return this.worshipSessionService.postWorshipSessionManual(
      churchId,
      worshipId,
      dto,
    );
  }

  @ApiGetSessionById()
  @Get(':sessionId')
  getSessionById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    throw new GoneException('더이상 사용되지 않는 엔드포인트');

    /*return this.worshipSessionService.getSessionById(
      churchId,
      worshipId,
      sessionId,
    );*/
  }

  @ApiPatchSession()
  @Patch(':sessionId')
  @WorshipWriteGuard()
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

  @ApiDeleteSession()
  @Delete(':sessionId')
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  deleteSessionById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipSessionService.deleteWorshipSessionById(
      churchId,
      worshipId,
      sessionId,
      qr,
    );
  }
}
