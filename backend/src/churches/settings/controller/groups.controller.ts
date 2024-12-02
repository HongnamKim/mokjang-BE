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

  @Patch(':groupId')
  patchGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.updateGroup(churchId, groupId, dto);
  }

  @Delete(':groupId')
  deleteGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    //@Query('cascade', ParseBoolPipe) cascade: boolean = false,
  ) {
    return this.groupsService.deleteGroup(churchId, groupId /*cascade*/);
  }

  @Get(':groupId/childGroups')
  getGroupsCascade(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.groupsService.getGroupsCascade(groupId);
  }
}
