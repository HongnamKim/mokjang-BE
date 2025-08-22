import { ApiTags } from '@nestjs/swagger';
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
import { MinistryGroupHistoryService } from '../service/ministry-group-history.service';
import { GetMinistryGroupHistoriesDto } from '../dto/request/group/get-ministry-group-histories.dto';
import { UpdateMinistryGroupHistoryDto } from '../dto/request/group/update-ministry-group-history.dto';
import {
  ApiDeleteMinistryGroupHistory,
  ApiGetMinistryGroupHistories,
  ApiPatchMinistryGroupHistory,
} from '../swagger/ministry-group-history.swagger';
import { GetMinistryGroupHistoryListDto } from '../dto/request/group/get-ministry-group-history-list.dto';

@ApiTags('Churches:Members:Histories:Ministries')
@Controller()
export class MinistryGroupHistoryController {
  constructor(
    private readonly ministryGroupHistoryService: MinistryGroupHistoryService,
  ) {}

  @ApiGetMinistryGroupHistories()
  @Get()
  getMinistryGroupHistories(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetMinistryGroupHistoriesDto,
  ) {
    return this.ministryGroupHistoryService.getMinistryGroupHistories(
      churchId,
      memberId,
      dto,
    );
  }

  @Get('current')
  getCurrentMinistryGroupHistories(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() query: GetMinistryGroupHistoryListDto,
  ) {
    return this.ministryGroupHistoryService.getCurrentMinistryGroupHistories(
      churchId,
      memberId,
      query,
    );
  }

  @ApiPatchMinistryGroupHistory()
  @Patch(':ministryGroupHistoryId')
  patchMinistryGroupHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Body() dto: UpdateMinistryGroupHistoryDto,
  ) {
    return this.ministryGroupHistoryService.patchMinistryGroupHistory(
      churchId,
      memberId,
      ministryGroupHistoryId,
      dto,
    );
  }

  @ApiDeleteMinistryGroupHistory()
  @Delete(':ministryGroupHistoryId')
  deleteMinistryGroupHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
  ) {
    return this.ministryGroupHistoryService.deleteMinistryGroupHistory(
      churchId,
      memberId,
      ministryGroupHistoryId,
    );
  }
}
