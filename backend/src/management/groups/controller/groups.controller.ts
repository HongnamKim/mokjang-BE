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
import { ApiTags } from '@nestjs/swagger';
import { GroupsService } from '../service/groups.service';
import { CreateGroupDto } from '../dto/group/create-group.dto';
import { UpdateGroupDto } from '../dto/group/update-group.dto';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import {
  ApiDeleteGroup,
  ApiGetChildGroupIds,
  ApiGetGroupById,
  ApiGetGroups,
  ApiPatchGroup,
  ApiPostGroups,
} from '../const/swagger/group.swagger';
import { GetGroupDto } from '../dto/group/get-group.dto';

@ApiTags('Management:Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiGetGroups()
  @Get()
  getGroups(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetGroupDto,
  ) {
    return this.groupsService.getGroups(churchId, dto);
  }

  @ApiPostGroups()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.createGroup(churchId, dto, qr);
  }

  @ApiGetGroupById()
  @Get(':groupId')
  getGroupById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getGroupByIdWithParents(churchId, groupId);
  }

  @ApiPatchGroup()
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

  @ApiDeleteGroup()
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

  @ApiGetChildGroupIds()
  @Get(':groupId/childGroups')
  getChildGroupIds(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getChildGroupIds(churchId, groupId);
  }
}
