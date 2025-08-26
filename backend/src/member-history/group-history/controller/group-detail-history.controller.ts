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
import { GroupDetailHistoryService } from '../service/group-detail-history.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiDeleteGroupDetailHistory,
  ApiGetGroupDetailHistory,
  ApiPatchGroupDetailHistory,
} from '../swagger/group-history.swagger';
import { GetGroupHistoryDto } from '../dto/request/get-group-history.dto';
import { UpdateGroupHistoryDto } from '../dto/request/update-group-history.dto';
import { HistoryReadGuard } from '../../guard/history-read.guard';
import { HistoryWriteGuard } from '../../guard/history-write.guard';

@ApiTags('Churches:Members:Groups')
@Controller('groups:groupHistoryId/details')
export class GroupDetailHistoryController {
  constructor(
    private readonly groupDetailHistoryService: GroupDetailHistoryService,
  ) {}

  @ApiGetGroupDetailHistory()
  @HistoryReadGuard()
  @Get()
  getGroupDetailHistories(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('groupHistoryId', ParseIntPipe) groupHistoryId: number,
    @Query() dto: GetGroupHistoryDto,
  ) {
    return this.groupDetailHistoryService.getDetailHistories(
      churchId,
      memberId,
      groupHistoryId,
      dto,
    );
  }

  @ApiPatchGroupDetailHistory()
  @HistoryWriteGuard()
  @Patch(':detailHistoryId')
  patchGroupDetailHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('groupHistoryId', ParseIntPipe) groupHistoryId: number,
    @Param('detailHistoryId', ParseIntPipe) detailHistoryId: number,
    @Body() dto: UpdateGroupHistoryDto,
  ) {
    return this.groupDetailHistoryService.patchDetailHistory(
      churchId,
      memberId,
      groupHistoryId,
      detailHistoryId,
      dto,
    );
  }

  @ApiDeleteGroupDetailHistory()
  @HistoryWriteGuard()
  @Delete(':detailHistoryId')
  deleteGroupDetailHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('groupHistoryId', ParseIntPipe) groupHistoryId: number,
    @Param('detailHistoryId', ParseIntPipe) detailHistoryId: number,
  ) {
    return this.groupDetailHistoryService.deleteDetailHistory(
      churchId,
      memberId,
      groupHistoryId,
      detailHistoryId,
    );
  }
}
