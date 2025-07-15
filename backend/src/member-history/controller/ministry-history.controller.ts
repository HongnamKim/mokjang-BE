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
import { MinistryHistoryService } from '../service/ministry-history.service';
import { CreateMemberMinistryDto } from '../dto/ministry/create-member-ministry.dto';
import { QueryRunner as QR } from 'typeorm';
import { EndMemberMinistryDto } from '../dto/ministry/end-member-ministry.dto';
import { GetMinistryHistoryDto } from '../dto/ministry/get-ministry-history.dto';
import { UpdateMinistryHistoryDto } from '../dto/ministry/update-ministry-history.dto';
import {
  ApiDeleteMemberMinistry,
  ApiDeleteMinistryHistory,
  ApiGetMemberMinistry,
  ApiPatchMinistryHistory,
  ApiPostMemberMinistry,
} from '../swagger/ministry-history.swagger';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { HistoryReadGuard } from '../guard/history-read.guard';
import { HistoryWriteGuard } from '../guard/history-write.guard';

@ApiTags('Churches:Members:Ministries')
@Controller('ministries')
export class MinistryHistoryController {
  constructor(
    private readonly ministryHistoryService: MinistryHistoryService,
  ) {}

  // 교인의 사역 조회 (현재)
  @ApiGetMemberMinistry()
  @Get()
  @HistoryReadGuard()
  getMemberMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetMinistryHistoryDto,
  ) {
    return this.ministryHistoryService.getMinistryHistories(
      churchId,
      memberId,
      dto,
    );
  }

  // 교인에게 현재 사역 부여
  // member 와 N:N relation 추가
  // ministryHistory 추가 (시작일)
  @ApiPostMemberMinistry()
  @Post()
  @HistoryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postMemberMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateMemberMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryHistoryService.createMemberMinistry(
      churchId,
      memberId,
      dto,
      qr,
    );
  }

  // 교인의 사역 이력 수정
  // 사역의 시작 날짜, 종료 날짜만 수정 가능
  @ApiPatchMinistryHistory()
  @Patch(':ministryHistoryId')
  @HistoryWriteGuard()
  patchMinistryHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryHistoryId', ParseIntPipe)
    ministryHistoryId: number,
    @Body() dto: UpdateMinistryHistoryDto,
  ) {
    return this.ministryHistoryService.updateMinistryHistory(
      churchId,
      memberId,
      ministryHistoryId,
      dto,
    );
  }

  // 교인의 현재 사역  종료
  // N:N relation 삭제
  // 해당 MinistryHistoryModel 에 endDate 추가
  @ApiDeleteMemberMinistry()
  @Patch(':ministryHistoryId/end')
  @HistoryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  deleteMemberMinistry(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryHistoryId', ParseIntPipe) ministryHistoryId: number,
    @Body() dto: EndMemberMinistryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryHistoryService.endMemberMinistry(
      churchId,
      memberId,
      ministryHistoryId,
      dto,
      qr,
    );
  }

  // 교인의 사역 이력 삭제
  @ApiDeleteMinistryHistory()
  @Delete(':ministryHistoryId')
  @HistoryWriteGuard()
  deleteMinistryHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryHistoryId', ParseIntPipe)
    ministryHistoryId: number,
  ) {
    return this.ministryHistoryService.deleteMinistryHistory(
      churchId,
      memberId,
      ministryHistoryId,
    );
  }
}
