import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
} from '../const/swagger/group/controller.swagger';
import { EndMemberGroupDto } from '../dto/group/end-member-group.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';

@ApiTags('Churches:Members:Groups')
@Controller('groups')
export class MemberGroupController {
  constructor(private readonly groupHistoryService: GroupHistoryService) {}

  @ApiGetMemberGroupHistory()
  @Get()
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

  @ApiOperation({
    deprecated: true,
    summary: '교인의 그룹 내 역할 수정',
    description:
      '<p><b>완성되지 않은 엔드포인트</b></p>' +
      '<p>역할의 수정도 이력 처리 해야하는 지에 대해 논의 필요</p>' +
      '<p>ex) 그룹원 --> 리더 변경 시</p>' +
      '<p>이력을 분리해야하는지</p>',
  })
  @Patch()
  patchMemberGroupRole() {
    throw new GoneException('사용되지 않는 엔드포인트');
  }

  @ApiEndMemberGroup()
  @Patch('end')
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
  @UseInterceptors(TransactionInterceptor)
  updateGroupHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('groupHistoryId', ParseIntPipe) groupHistoryId: number,
    @Body() dto: UpdateGroupHistoryDto,
    @QueryRunner() qr: QR,
  ) {
    //return dto;
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
  //@UseInterceptors(TransactionInterceptor)
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
