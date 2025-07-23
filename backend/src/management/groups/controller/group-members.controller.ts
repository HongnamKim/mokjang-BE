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
import { GroupMembersService } from '../service/group-members.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetGroupMembersDto } from '../dto/request/members/get-group-members.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { AddMembersToGroupDto } from '../dto/request/members/add-members-to-group.dto';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { RemoveMembersFromGroupDto } from '../dto/request/members/remove-members-from-group.dto';

@ApiTags('Management:Groups:Members')
@Controller('groups/:groupId/members')
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @ApiOperation({ summary: '그룹 내 교인 조회' })
  @Get()
  getGroupMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() dto: GetGroupMembersDto,
  ) {
    return this.groupMembersService.getGroupMembers(churchId, groupId, dto);
  }

  @ApiOperation({ summary: '그룹에 교인 추가' })
  @Patch()
  @UseInterceptors(TransactionInterceptor)
  addMembersToGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: AddMembersToGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupMembersService.addMembersToGroup(
      churchId,
      groupId,
      dto,
      qr,
    );
  }

  @ApiOperation({ summary: '그룹에서 교인 삭제' })
  @Delete()
  @UseInterceptors(TransactionInterceptor)
  removeMembersFromGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: RemoveMembersFromGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupMembersService.removeMembersFromGroup(
      churchId,
      groupId,
      dto,
      qr,
    );
  }
}
