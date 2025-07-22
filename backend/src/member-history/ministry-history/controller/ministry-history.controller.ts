import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MinistryHistoryService } from '../service/ministry-history.service';
import { GetMinistryHistoriesDto } from '../dto/request/ministry/get-ministry-histories.dto';
import { UpdateMinistryHistoryDto } from '../dto/request/ministry/update-ministry-history.dto';
import {
  ApiDeleteMinistryHistory,
  ApiGetMemberMinistry,
  ApiPatchMinistryHistory,
} from '../swagger/ministry-history.swagger';
import { HistoryReadGuard } from '../../guard/history-read.guard';
import { HistoryWriteGuard } from '../../guard/history-write.guard';

@ApiTags('Churches:Members:Histories:Ministries')
@Controller(':ministryGroupHistoryId/ministries')
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
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Query() dto: GetMinistryHistoriesDto,
  ) {
    return this.ministryHistoryService.getMinistryHistories(
      churchId,
      memberId,
      ministryGroupHistoryId,
      dto,
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
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Param('ministryHistoryId', ParseIntPipe)
    ministryHistoryId: number,
    @Body() dto: UpdateMinistryHistoryDto,
  ) {
    return this.ministryHistoryService.updateMinistryHistory(
      churchId,
      memberId,
      ministryGroupHistoryId,
      ministryHistoryId,
      dto,
    );
  }

  // 교인의 사역 이력 삭제
  @ApiDeleteMinistryHistory()
  @Delete(':ministryHistoryId')
  @HistoryWriteGuard()
  deleteMinistryHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Param('ministryHistoryId', ParseIntPipe)
    ministryHistoryId: number,
  ) {
    return this.ministryHistoryService.deleteMinistryHistory(
      churchId,
      memberId,
      ministryGroupHistoryId,
      ministryHistoryId,
    );
  }
}
