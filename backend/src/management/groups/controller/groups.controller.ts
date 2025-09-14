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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupsService } from '../service/groups.service';
import { CreateGroupDto } from '../dto/request/create-group.dto';
import { UpdateGroupNameDto } from '../dto/request/update-group-name.dto';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import {
  ApiDeleteGroup,
  ApiGetGroupById,
  ApiGetGroups,
  ApiGetUnassignedMembers,
  ApiPatchGroupLeader,
  ApiPatchGroupName,
  ApiPatchGroupStructure,
  ApiPostGroups,
  ApiRefreshGroupCount,
} from '../const/swagger/group.swagger';
import { GetGroupDto } from '../dto/request/get-group.dto';
import { GroupReadGuard } from '../guard/group-read.guard';
import { GroupWriteGuard } from '../guard/group-write.guard';
import { UpdateGroupStructureDto } from '../dto/request/update-group-structure.dto';
import { RequestChurch } from '../../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UpdateGroupLeaderDto } from '../dto/request/update-group-leader.dto';
import { GetUnassignedMembersDto } from '../../ministries/dto/ministry-group/request/member/get-unassigned-members.dto';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';
import { RequestManager } from '../../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

@ApiTags('Management:Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiGetGroups()
  @Get()
  @GroupReadGuard()
  getGroups(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetGroupDto,
  ) {
    return this.groupsService.getGroups(church, dto);
  }

  @ApiPostGroups()
  @GroupWriteGuard()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: CreateGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.createGroup(church, dto, qr);
  }

  @ApiRefreshGroupCount()
  @Patch('refresh-count')
  @GroupWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshGroupCount(
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.refreshGroupCount(church, qr);
  }

  @ApiGetUnassignedMembers()
  @Get('unassigned-member')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getUnassignedMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Query() dto: GetUnassignedMembersDto,
  ) {
    return this.groupsService.getUnassignedMembers(church, requestManager, dto);
  }

  @ApiGetGroupById()
  @GroupReadGuard()
  @Get(':groupId')
  getGroupById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getGroupByIdWithParents(church, groupId);
  }

  @ApiDeleteGroup()
  @GroupWriteGuard()
  @Delete(':groupId')
  @UseInterceptors(TransactionInterceptor)
  deleteGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.deleteGroup(church, groupId, qr);
  }

  @ApiPatchGroupLeader()
  @Patch(':groupId/leader')
  @GroupWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchGroupLeader(
    @RequestChurch() church: ChurchModel,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: UpdateGroupLeaderDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.updateGroupLeader(church, groupId, dto, qr);
  }

  @ApiPatchGroupName()
  @GroupWriteGuard()
  @Patch(':groupId/name')
  @UseInterceptors(TransactionInterceptor)
  patchGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: UpdateGroupNameDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.updateGroupName(church, groupId, dto, qr);
  }

  @ApiPatchGroupStructure()
  @Patch(':groupId/structure')
  @GroupWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchGroupStructure(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: UpdateGroupStructureDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.updateGroupStructure(church, groupId, dto, qr);
  }
}
