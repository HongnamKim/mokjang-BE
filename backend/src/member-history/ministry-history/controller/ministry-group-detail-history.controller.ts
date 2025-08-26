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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinistryGroupDetailHistoryService } from '../service/ministry-group-detail-history.service';
import { GetMinistryGroupDetailHistoriesDto } from '../dto/request/detail/get-ministry-group-detail-histories.dto';
import { UpdateMinistryGroupDetailHistoryDto } from '../dto/request/detail/update-ministry-group-detail-history.dto';
import { HistoryReadGuard } from '../../guard/history-read.guard';
import { HistoryWriteGuard } from '../../guard/history-write.guard';

@ApiTags('Churches:Members:Histories:Ministries')
@Controller(':ministryGroupHistoryId/details')
export class MinistryGroupDetailHistoryController {
  constructor(
    private readonly ministryGroupDetailHistoryService: MinistryGroupDetailHistoryService,
  ) {}

  @ApiOperation({ summary: '사역그룹 상세 이력 조회 (사역 + 역할)' })
  @HistoryReadGuard()
  @Get()
  getDetailHistories(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Query() dto: GetMinistryGroupDetailHistoriesDto,
  ) {
    return this.ministryGroupDetailHistoryService.getDetailHistories(
      churchId,
      memberId,
      ministryGroupHistoryId,
      dto,
    );
  }

  @ApiOperation({ summary: '사역그룹 상세 이력 수정' })
  @HistoryWriteGuard()
  @Patch(':detailHistoryId')
  patchDetailHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Param('detailHistoryId', ParseIntPipe) detailHistoryId: number,
    @Body() dto: UpdateMinistryGroupDetailHistoryDto,
  ) {
    return this.ministryGroupDetailHistoryService.patchDetailHistory(
      churchId,
      memberId,
      ministryGroupHistoryId,
      detailHistoryId,
      dto,
    );
  }

  @ApiOperation({ summary: '사역그룹 상세 이력 삭제' })
  @HistoryWriteGuard()
  @Delete(':detailHistoryId')
  deleteDetailHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Param('detailHistoryId', ParseIntPipe) detailHistoryId: number,
  ) {
    return this.ministryGroupDetailHistoryService.deleteDetailHistory(
      churchId,
      memberId,
      ministryGroupHistoryId,
      detailHistoryId,
    );
  }
}
