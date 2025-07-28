import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinistryGroupDetailHistoryService } from '../service/ministry-group-detail-history.service';

@ApiTags('Churches:Members:Histories:Ministries')
@Controller(':ministryGroupHistoryId/details')
export class MinistryGroupDetailHistoryController {
  constructor(
    private readonly ministryGroupDetailHistoryService: MinistryGroupDetailHistoryService,
  ) {}

  @ApiOperation({ summary: '사역그룹 상세 이력 조회 (사역 + 역할)' })
  @Get()
  getDetailHistories(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
  ) {
    return this.ministryGroupDetailHistoryService.getDetailHistories(
      churchId,
      memberId,
      ministryGroupHistoryId,
    );
  }

  @ApiOperation({ summary: '사역그룹 상세 이력 수정' })
  @Patch(':detailHistoryId')
  patchDetailHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Param('detailHistoryId', ParseIntPipe) detailHistoryId: number,
  ) {}

  @ApiOperation({ summary: '사역그룹 상세 이력 삭제' })
  @Delete(':detailHistoryId')
  deleteDetailHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Param('detailHistoryId', ParseIntPipe) detailHistoryId: number,
  ) {}
}
