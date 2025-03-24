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
  UseInterceptors,
} from '@nestjs/common';
import { CreateGroupRoleDto } from '../dto/create-group-role.dto';
import { UpdateGroupRoleDto } from '../dto/update-group-role.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupRolesService } from '../service/group-roles.service';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';

@ApiTags('Management:Groups:Roles')
@Controller('groups')
export class GroupsRolesController {
  constructor(private readonly groupsRolesService: GroupRolesService) {}

  @ApiOperation({
    deprecated: true,
  })
  @Post('roles')
  createRoleForAllGroups(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateGroupRoleDto,
  ) {
    throw new GoneException('사용하지 않는 엔드포인트');
    //return this.groupsRolesService.createRoleForAllGroups(churchId, dto);
  }

  @Get(':groupId/role')
  getGroupRoles(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsRolesService.getGroupRoles(churchId, groupId);
  }

  @Post(':groupId/role')
  @UseInterceptors(TransactionInterceptor)
  postGroupRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateGroupRoleDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsRolesService.createGroupRole(churchId, groupId, dto, qr);
  }

  @Patch(':groupId/role/:roleId')
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

  @Delete(':groupId/role/:roleId')
  deleteGroupRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.groupsRolesService.deleteGroupRole(churchId, groupId, roleId);
  }
}
