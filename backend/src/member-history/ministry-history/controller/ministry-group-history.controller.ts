import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Get, Patch } from '@nestjs/common';

@ApiTags('Churches:Members:Histories:Ministries')
@Controller('ministry-group')
export class MinistryGroupHistoryController {
  constructor() {}

  @ApiOperation({ summary: '사역그룹 이력 조회' })
  @Get()
  getMinistryGroupHistory() {}

  @ApiOperation({ summary: '사역그룹 이력 날짜 수정' })
  @Patch(':ministryGroupHistoryId')
  patchMinistryGroupHistory() {}

  @ApiOperation({ summary: '사역그룹 이력 삭제' })
  @Delete(':ministryGroupHistoryId')
  deleteMinistryGroupHistory() {}
}
