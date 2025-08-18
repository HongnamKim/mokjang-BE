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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorshipSessionService } from '../service/worship-session.service';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { GetWorshipSessionsDto } from '../dto/request/worship-session/get-worship-sessions.dto';
import { UpdateWorshipSessionDto } from '../dto/request/worship-session/update-worship-session.dto';
import {
  ApiDeleteSession,
  ApiGetOrPostRecentSession,
  ApiGetOrPostSessionByDate,
  ApiGetSessionById,
  ApiGetSessions,
  ApiGetWorshipSessionStatistics,
  ApiPatchSession,
  ApiPostSessionManual,
} from '../swagger/worship-session.swagger';
import { CreateWorshipSessionDto } from '../dto/request/worship-session/create-worship-session.dto';
import { WorshipReadGuard } from '../guard/worship-read.guard';
import { WorshipWriteGuard } from '../guard/worship-write.guard';
import { GetWorshipSessionDto } from '../dto/request/worship-session/get-worship-session.dto';
import { GetWorshipSessionStatsDto } from '../dto/request/worship-session/get-worship-session-stats.dto';
import { WorshipTargetGroupIds } from '../decorator/worship-target-group-ids.decorator';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainName } from '../../permission/const/domain-name.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { WorshipGroupFilterGuard } from '../guard/worship-group-filter.guard';
import { WorshipReadScopeGuard } from '../guard/worship-read-scope.guard';
import { RequestChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { RequestWorship } from '../decorator/request-worship.decorator';
import { WorshipModel } from '../entity/worship.entity';

@ApiTags('Worships:Sessions')
@Controller(':worshipId/sessions')
export class WorshipSessionController {
  constructor(private readonly worshipSessionService: WorshipSessionService) {}

  @ApiGetSessions()
  @Get()
  @WorshipReadGuard()
  getSessions(
    @RequestChurch() church: ChurchModel,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Query() dto: GetWorshipSessionsDto,
  ) {
    return this.worshipSessionService.getWorshipSessions(
      church,
      worshipId,
      dto,
    );
  }

  @ApiGetOrPostSessionByDate()
  @Post()
  @WorshipReadGuard()
  @UseInterceptors(TransactionInterceptor)
  getOrPostSessionByDate(
    @RequestChurch() church: ChurchModel,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Query() dto: GetWorshipSessionDto,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipSessionService.getOrPostWorshipSession(
      church,
      worshipId,
      dto,
      qr,
    );
  }

  @ApiGetWorshipSessionStatistics()
  @Get(':sessionId/statistics')
  @UseGuards(
    AccessTokenGuard,
    createDomainGuard(
      DomainType.WORSHIP,
      DomainName.WORSHIP,
      DomainAction.READ,
    ),
    WorshipGroupFilterGuard,
    WorshipReadScopeGuard,
  )
  getWorshipSessionStatistics(
    @RequestChurch() church: ChurchModel,
    @RequestWorship() worship: WorshipModel,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @WorshipTargetGroupIds() defaultWorshipTargetGroupIds: number[] | undefined,
    @Query() dto: GetWorshipSessionStatsDto,
  ) {
    return this.worshipSessionService.getWorshipSessionStatistics(
      church,
      worship,
      sessionId,
      defaultWorshipTargetGroupIds,
      dto,
    );
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

  @ApiGetOrPostRecentSession()
  @Post('recent')
  @WorshipReadGuard()
  @UseInterceptors(TransactionInterceptor)
  getOrPostRecentSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @QueryRunner() qr: QR,
  ) {
    throw new GoneException(
      '/churches/{churchId}/worships/{worshipId}/sessions 로 요청',
    );

    /*return this.worshipSessionService.getOrPostWorshipSession(
      churchId,
      worshipId,
      new GetWorshipSessionDto(),
      qr,
    );*/
  }

  @ApiPostSessionManual()
  @Post('manual')
  @WorshipWriteGuard()
  postSessionManual(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Body() dto: CreateWorshipSessionDto,
  ) {
    throw new GoneException('더 이상 사용되지 않는 엔드포인트');

    /*return this.worshipSessionService.postWorshipSessionManual(
      churchId,
      worshipId,
      dto,
    );*/
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
}
