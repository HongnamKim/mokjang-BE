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
  ApiPatchGroupLeader,
  ApiPatchGroupName,
  ApiPatchGroupStructure,
  ApiPostGroups,
  ApiRefreshGroupCount,
} from '../const/swagger/group.swagger';
import { GetGroupDto } from '../dto/request/get-group.dto';
import { GroupReadGuard } from '../guard/group-read.guard';
import { GroupWriteGuard } from '../guard/group-write.guard';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';
import { UpdateGroupStructureDto } from '../dto/request/update-group-structure.dto';
import { PermissionChurch } from '../../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UpdateGroupLeaderDto } from '../dto/request/update-group-leader.dto';

@ApiTags('Management:Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiGetGroups()
  @Get()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getGroups(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetGroupDto,
  ) {
    return this.groupsService.getGroups(churchId, dto);
  }

  @ApiPostGroups()
  @GroupWriteGuard()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.createGroup(churchId, dto, qr);
  }

  @ApiRefreshGroupCount()
  @Patch('refresh-count')
  @GroupWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshGroupCount(
    @PermissionChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.refreshGroupCount(church, qr);
  }

  @ApiGetGroupById()
  @GroupReadGuard()
  @Get(':groupId')
  getGroupById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getGroupByIdWithParents(churchId, groupId);
  }

  @ApiDeleteGroup()
  @GroupWriteGuard()
  @Delete(':groupId')
  @UseInterceptors(TransactionInterceptor)
  deleteGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.deleteGroup(churchId, groupId, qr);
  }

  @ApiPatchGroupLeader()
  @Patch(':groupId/leader')
  @GroupWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchGroupLeader(
    @PermissionChurch() church: ChurchModel,
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
    @Body() dto: UpdateGroupNameDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.updateGroupName(churchId, groupId, dto, qr);
  }

  @ApiPatchGroupStructure()
  @Patch(':groupId/structure')
  @GroupWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchGroupStructure(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: UpdateGroupStructureDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.updateGroupStructure(churchId, groupId, dto, qr);
  }
}
