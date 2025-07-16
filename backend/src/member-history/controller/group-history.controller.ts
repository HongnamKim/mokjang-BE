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
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { GetGroupHistoryDto } from '../dto/group/get-group-history.dto';
import { GroupHistoryService } from '../service/group-history.service';
import { AddMemberToGroupDto } from '../dto/group/add-member-to-group.dto';
import { UpdateGroupHistoryDto } from '../dto/group/update-group-history.dto';
import {
  ApiDeleteGroupHistory,
  ApiEndMemberGroup,
  ApiGetMemberGroupHistory,
  ApiPatchGroupHistory,
  ApiPostMemberGroup,
} from '../swagger/group-history.swagger';
import { EndMemberGroupDto } from '../dto/group/end-member-group.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { HistoryReadGuard } from '../guard/history-read.guard';
import { HistoryWriteGuard } from '../guard/history-write.guard';

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

  @ApiPostMemberGroup()
  @Post()
  @HistoryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postMemberGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: AddMemberToGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupHistoryService.addMemberToGroup(
      churchId,
      memberId,
      dto,
      qr,
    );
  }

  @ApiEndMemberGroup()
  @Patch('end')
  @HistoryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  endMemberGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: EndMemberGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupHistoryService.endMemberGroup(churchId, memberId, dto, qr);
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
