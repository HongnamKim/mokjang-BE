import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetMinistryGroupRoleHistoriesDto } from '../dto/request/role/get-ministry-group-role-histories.dto';
import { MinistryGroupRoleHistoryService } from '../service/ministry-group-role-history.service';
import {
  ApiDeleteRoleHistory,
  ApiGetRoleHistories,
  ApiPatchRoleHistory,
} from '../swagger/ministry-group-role-history.swagger';
import { UpdateMinistryGroupRoleHistoryDto } from '../dto/request/role/update-ministry-group-role-history.dto';

@ApiTags('Churches:Members:Histories:Ministries')
@Controller(':ministryGroupHistoryId/roles')
export class MinistryGroupRoleHistoryController {
  constructor(
    private readonly ministryGroupRoleHistoryService: MinistryGroupRoleHistoryService,
  ) {}

  @ApiGetRoleHistories()
  @Get()
  getRoleHistories(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Query() dto: GetMinistryGroupRoleHistoriesDto,
  ) {
    return this.ministryGroupRoleHistoryService.getRoleHistories(
      churchId,
      memberId,
      ministryGroupHistoryId,
      dto,
    );
  }

  @ApiPatchRoleHistory()
  @Patch(':roleHistoryId')
  patchRoleHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Param('roleHistoryId', ParseIntPipe) roleHistoryId: number,
    @Body() dto: UpdateMinistryGroupRoleHistoryDto,
  ) {
    return this.ministryGroupRoleHistoryService.patchRoleHistory(
      churchId,
      memberId,
      ministryGroupHistoryId,
      roleHistoryId,
      dto,
    );
  }

  @ApiDeleteRoleHistory()
  @Delete(':roleHistoryId')
  deleteRoleHistory(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ministryGroupHistoryId', ParseIntPipe)
    ministryGroupHistoryId: number,
    @Param('roleHistoryId', ParseIntPipe) roleHistoryId: number,
  ) {
    return this.ministryGroupRoleHistoryService.deleteRoleHistory(
      churchId,
      memberId,
      ministryGroupHistoryId,
      roleHistoryId,
    );
  }
}
