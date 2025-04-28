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
import { CreateGroupRoleDto } from '../dto/group-role/create-group-role.dto';
import { UpdateGroupRoleDto } from '../dto/group-role/update-group-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { GroupRolesService } from '../service/group-roles.service';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { GetGroupRoleDto } from '../dto/group-role/get-group-role.dto';
import {
  ApiDeleteGroupRole,
  ApiGetGroupRoles,
  ApiPatchGroupRole,
  ApiPostGroupRole,
} from '../const/swagger/group-role.swagger';

@ApiTags('Management:Groups:Roles')
@Controller('groups/:groupId/role')
export class GroupsRolesController {
  constructor(private readonly groupsRolesService: GroupRolesService) {}

  @ApiGetGroupRoles()
  @Get()
  getGroupRoles(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() dto: GetGroupRoleDto,
  ) {
    return this.groupsRolesService.getGroupRoles(churchId, groupId, dto);
  }

  @ApiPostGroupRole()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postGroupRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateGroupRoleDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsRolesService.createGroupRole(churchId, groupId, dto, qr);

    //return new PostGroupRoleResponseDto(groupRole);
  }

  @ApiPatchGroupRole()
  @Patch(':roleId')
  patchGroupRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: UpdateGroupRoleDto,
  ) {
    return this.groupsRolesService.updateGroupRole(
      churchId,
      groupId,
      roleId,
      dto,
    );
  }

  @ApiDeleteGroupRole()
  @Delete(':roleId')
  deleteGroupRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.groupsRolesService.deleteGroupRole(churchId, groupId, roleId);
  }
}
