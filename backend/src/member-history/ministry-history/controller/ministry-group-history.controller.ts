import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { MinistryGroupHistoryService } from '../service/ministry-group-history.service';

@ApiTags('Churches:Members:Histories:Ministries')
@Controller('ministry-group')
export class MinistryGroupHistoryController {
  constructor(
    private readonly ministryGroupHistoryService: MinistryGroupHistoryService,
  ) {}

  @ApiOperation({ summary: '사역그룹 이력 조회' })
  @Get()
  getMinistryGroupHistories(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.ministryGroupHistoryService.getMinistryGroupHistories(
      churchId,
      memberId,
    );
  }

  @ApiOperation({ summary: '사역그룹 이력 날짜 수정' })
  @Patch(':ministryGroupHistoryId')
  patchMinistryGroupHistory() {}

  @ApiOperation({ summary: '사역그룹 이력 삭제' })
  @Delete(':ministryGroupHistoryId')
  deleteMinistryGroupHistory() {}
}
