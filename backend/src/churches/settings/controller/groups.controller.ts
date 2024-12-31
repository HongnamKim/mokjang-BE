import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupsService } from '../service/groups.service';
import { CreateGroupDto } from '../dto/group/create-group.dto';
import { UpdateGroupDto } from '../dto/group/update-group.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
// import { CreateGroupRoleDto } from '../dto/group/create-group-role.dto';
// import { UpdateGroupRoleDto } from '../dto/group/update-group-role.dto';

@ApiTags('Settings:Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  getGroups(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.groupsService.getGroups(churchId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.postGroup(churchId, dto, qr);
  }

  @Get(':groupId')
  getGroupById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getGroupById(churchId, groupId, undefined, {
      members: true,
    });
  }

  @Patch(':groupId')
  @UseInterceptors(TransactionInterceptor)
  patchGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: UpdateGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.updateGroup(churchId, groupId, dto, qr);
  }

  @Delete(':groupId')
  @UseInterceptors(TransactionInterceptor)
  deleteGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @QueryRunner() qr: QR,
    //@Query('cascade', ParseBoolPipe) cascade: boolean = false,
  ) {
    return this.groupsService.deleteGroup(churchId, groupId, qr /*cascade*/);
  }

  @Get(':groupId/childGroups')
  getGroupsCascade(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getGroupsCascade(groupId);
  }

  /*@Get(':groupId/role')
  getGroupRoles(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getGroupRoles(churchId, groupId);
  }

  @Post(':groupId/role')
  postGroupRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateGroupRoleDto,
  ) {
    return this.groupsService.createGroupRole(churchId, groupId, dto);
  }

  @Patch(':groupId/role/:roleId')
  patchGroupRole(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: UpdateGroupRoleDto,
  ) {
    return this.groupsService.updateGroupRole(groupId, roleId, dto);
  }

  @Delete(':groupId/role/:roleId')
  deleteGroupRole(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.groupsService.deleteGroupRole(groupId, roleId);
  }*/
}
