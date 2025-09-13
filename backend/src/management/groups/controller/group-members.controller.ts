import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
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
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';
import { RequestChurch } from '../../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { RequestManager } from '../../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { GroupWriteGuard } from '../guard/group-write.guard';

@ApiTags('Management:Groups:Members')
@Controller('groups/:groupId/members')
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @ApiOperation({
    summary: '그룹 내 교인 조회',
    description: '관리자는 조회 가능, 권한 범위로 필터링',
  })
  @Get()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getGroupMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Query() dto: GetGroupMembersDto,
  ) {
    return this.groupMembersService.getGroupMembers(churchId, groupId, dto);
  }

  @ApiOperation({
    summary: '그룹에 교인 추가',
    description: 'management 권한 관리자만 가능',
  })
  @Patch()
  @GroupWriteGuard()
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

  @ApiOperation({
    summary: '그룹에서 교인 삭제',
    description: 'management 권한 관리자만 가능',
  })
  @Delete()
  @GroupWriteGuard()
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

  @ApiOperation({
    summary: '그룹 내 교인 수 새로고침',
    description: 'management 권한 관리자만 가능',
  })
  @Patch('refresh-count')
  @GroupWriteGuard()
  refreshMembersCount(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupMembersService.refreshMembersCount(churchId, groupId);
  }
}
