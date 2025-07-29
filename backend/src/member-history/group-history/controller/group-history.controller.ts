import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { GetGroupHistoryDto } from '../dto/request/get-group-history.dto';
import { GroupHistoryService } from '../service/group-history.service';
import { UpdateGroupHistoryDto } from '../dto/request/update-group-history.dto';
import {
  ApiDeleteGroupHistory,
  ApiGetMemberGroupHistory,
  ApiPatchGroupHistory,
} from '../swagger/group-history.swagger';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { HistoryReadGuard } from '../../guard/history-read.guard';
import { HistoryWriteGuard } from '../../guard/history-write.guard';

@ApiTags('Churches:Members:Groups')
@Controller('groups')
export class GroupHistoryController {
  constructor(private readonly groupHistoryService: GroupHistoryService) {}

  @ApiGetMemberGroupHistory()
  @Get()
  @HistoryReadGuard()
  getMemberGroupHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetGroupHistoryDto,
  ) {
    return this.groupHistoryService.getMemberGroupHistory(
      churchId,
      memberId,
      dto,
    );
  }

  @ApiPatchGroupHistory()
  @Patch(':groupHistoryId')
  @HistoryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  updateGroupHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('groupHistoryId', ParseIntPipe) groupHistoryId: number,
    @Body() dto: UpdateGroupHistoryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupHistoryService.updateGroupHistory(
      churchId,
      memberId,
      groupHistoryId,
      dto,
      qr,
    );
  }

  @ApiDeleteGroupHistory()
  @Delete(':groupHistoryId')
  @HistoryWriteGuard()
  deleteGroupHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('groupHistoryId', ParseIntPipe) groupHistoryId: number,
  ) {
    return this.groupHistoryService.deleteGroupHistory(
      churchId,
      memberId,
      groupHistoryId,
    );
  }
}
