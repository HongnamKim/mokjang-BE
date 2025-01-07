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
import { MemberGroupService } from '../service/member-group.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { UpdateMemberGroupPipe } from '../pipe/update-member-group.pipe';
import { UpdateMemberGroupDto } from '../dto/update-member-group.dto';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { GetGroupHistoryDto } from '../dto/group/get-group-history.dto';
import { GroupHistoryService } from '../service/group-history.service';
import { CreateGroupHistoryDto } from '../dto/group/create-group-history.dto';
import { UpdateGroupHistoryDto } from '../dto/group/update-group-history.dto';

@ApiTags('Churches:Members:Groups')
@Controller('groups')
export class GroupHistoryController {
  constructor(
    private readonly memberGroupService: MemberGroupService,
    private readonly groupHistoryService: GroupHistoryService,
  ) {}

  @ApiOperation({
    summary: '교인의 그룹 이력 조회',
    description:
      '<p>교인의 그룹 이력을 날짜 기준으로 조회합니다.</p>' +
      '<p>정렬 기준</p>' +
      '<p>1. 종료 날짜</p>' +
      '<p>2. 시작 날짜</p>' +
      '<p>3. 이력 생성 날짜</p>',
  })
  @Get()
  getGroupHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() dto: GetGroupHistoryDto,
  ) {
    return this.groupHistoryService.getGroupHistory(churchId, memberId, dto);
  }

  @ApiOperation({
    summary: '교인의 그룹 이력 생성',
    description:
      '<p>교인의 그룹 이력을 생성합니다.</p>' +
      '<p>필수값: 그룹 ID(groupId), 시작 날짜(startDate)</p>' +
      '<p>선택값: 그룹 내 역할 ID(groupRoleId), 종료 날짜(endDate), 이전 그룹 자동 종료(autoEndDate)</p>' +
      '<p><b>Exception 예시</b></p>' +
      '<p>시작 날짜, 종료 날짜가 현재 날짜를 넘어서는 경우 BadRequestException</p>' +
      '<p>시작 날짜, 종료 날짜를 모두 입력할 경우 --> 종료 날짜가 시작 날짜를 앞설 경우 BadRequestException</p>' +
      '<p>소속이 종료되지 않은 상태에서 새로운 그룹 이력을 추가하는 경우 BadRequestException</p>',
  })
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postGroupHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateGroupHistoryDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupHistoryService.createGroupHistory(
      churchId,
      memberId,
      dto,
      qr,
    );
  }

  @ApiOperation({
    summary: '교인의 그룹 이력 수정',
  })
  @Patch(':groupHistoryId')
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

  @ApiOperation({
    summary: '교인의 그룹 이력 삭제',
  })
  @Delete(':groupHistoryId')
  @UseInterceptors(TransactionInterceptor)
  deleteGroupHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('groupHistoryId', ParseIntPipe) groupHistoryId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.groupHistoryService.deleteGroupHistory(
      memberId,
      groupHistoryId,
      qr,
    );
  }

  @ApiOperation({
    deprecated: true,
    summary: '교인의 소그룹 수정/삭제',
    description:
      '<p>isDeleteEducation 가 true 일 경우 소그룹 삭제</p>' +
      '<p>isDeleteEducation 필수, groupId 그룹 등록 시 필수, 그룹 삭제 시 생략 가능</p>' +
      '<p>이미 소속된 소그룹 등록 시 BadRequestException("이미 등록된 소그룹입니다.")</p>' +
      '<p>부여되지 않은 소그룹 삭제 시 BadRequestException("등록되지 않은 소그룹을 삭제할 수 없습니다.")</p>',
  })
  @Patch('groups')
  @UseInterceptors(TransactionInterceptor)
  patchMemberGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body(UpdateMemberGroupPipe) dto: UpdateMemberGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.memberGroupService.updateMemberGroup(
      churchId,
      memberId,
      dto,
      qr,
    );
  }
}
