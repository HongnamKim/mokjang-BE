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
import { MinistryGroupService } from '../service/ministry-group.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateMinistryGroupDto } from '../dto/ministry-group/request/create-ministry-group.dto';
import { QueryRunner as QR } from 'typeorm';
import { UpdateMinistryGroupNameDto } from '../dto/ministry-group/request/update-ministry-group-name.dto';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { GetMinistryGroupDto } from '../dto/ministry-group/request/get-ministry-group.dto';
import { MinistryWriteGuard } from '../guard/ministry-write.guard';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';
import { UpdateMinistryGroupStructureDto } from '../dto/ministry-group/request/update-ministry-group-structure.dto';
import {
  ApiPatchMinistryGroupLeader,
  ApiPatchMinistryGroupName,
  ApiPatchMinistryGroupStructure,
  ApiRefreshMinistryGroupCount,
} from '../const/swagger/ministry-group.swagger';
import { PermissionChurch } from '../../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UpdateMinistryGroupLeaderDto } from '../dto/ministry-group/request/update-ministry-group-leader.dto';
import { GetUnassignedMembersDto } from '../dto/ministry-group/request/member/get-unassigned-members.dto';

@ApiTags('Management:MinistryGroups')
@Controller('ministry-groups')
export class MinistryGroupsController {
  constructor(private readonly ministryGroupService: MinistryGroupService) {}

  @Get()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMinistryGroups(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetMinistryGroupDto,
  ) {
    return this.ministryGroupService.getMinistryGroups(churchId, dto);
  }

  @Post()
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateMinistryGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.createMinistryGroup(churchId, dto, qr);
  }

  @ApiRefreshMinistryGroupCount()
  @Patch('refresh-count')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshMinistryGroupCount(
    @PermissionChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.refreshMinistryGroupCount(church, qr);
  }

  @Get('unassigned-member')
  getUnassignedMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetUnassignedMembersDto,
  ) {
    return this.ministryGroupService.getUnassignedMembers(churchId, dto);
  }

  @Get(':ministryGroupId')
  getMinistryGroupById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
  ) {
    return this.ministryGroupService.getMinistryGroupById(
      churchId,
      ministryGroupId,
    );
  }

  @Delete(':ministryGroupId')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  deleteMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.deleteMinistryGroup(
      churchId,
      ministryGroupId,
      qr,
    );
  }

  @ApiPatchMinistryGroupName()
  @Patch(':ministryGroupId/name')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchMinistryGroupName(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Body() dto: UpdateMinistryGroupNameDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.updateMinistryGroupName(
      churchId,
      ministryGroupId,
      dto,
      qr,
    );
  }

  @ApiPatchMinistryGroupStructure()
  @Patch(':ministryGroupId/structure')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchMinistryGroupStructure(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Body() dto: UpdateMinistryGroupStructureDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.updateMinistryGroupStructure(
      churchId,
      ministryGroupId,
      dto,
      qr,
    );
  }

  @ApiPatchMinistryGroupLeader()
  @Patch(':ministryGroupId/leader')
  @UseInterceptors(TransactionInterceptor)
  patchMinistryGroupLeader(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @Body() dto: UpdateMinistryGroupLeaderDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.updateMinistryGroupLeader(
      churchId,
      ministryGroupId,
      dto,
      qr,
    );
  }
}
