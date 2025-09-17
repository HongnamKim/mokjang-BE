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
import { UpdateMinistryGroupStructureDto } from '../dto/ministry-group/request/update-ministry-group-structure.dto';
import {
  ApiPatchMinistryGroupLeader,
  ApiPatchMinistryGroupName,
  ApiPatchMinistryGroupStructure,
  ApiRefreshMinistryGroupCount,
} from '../const/swagger/ministry-group.swagger';
import { RequestChurch } from '../../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UpdateMinistryGroupLeaderDto } from '../dto/ministry-group/request/update-ministry-group-leader.dto';
import { GetUnassignedMembersDto } from '../dto/ministry-group/request/member/get-unassigned-members.dto';
import { MinistryReadGuard } from '../guard/ministry-read.guard';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';
import { RequestManager } from '../../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

@ApiTags('Management:MinistryGroups')
@Controller('ministry-groups')
export class MinistryGroupsController {
  constructor(private readonly ministryGroupService: MinistryGroupService) {}

  @Get()
  @MinistryReadGuard()
  getMinistryGroups(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetMinistryGroupDto,
  ) {
    return this.ministryGroupService.getMinistryGroups(church, dto);
  }

  @Post()
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: CreateMinistryGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.createMinistryGroup(church, dto, qr);
  }

  @ApiRefreshMinistryGroupCount()
  @Patch('refresh-count')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshMinistryGroupCount(
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.refreshMinistryGroupCount(church, qr);
  }

  @Get('unassigned-member')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getUnassignedMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Query() dto: GetUnassignedMembersDto,
  ) {
    return this.ministryGroupService.getUnassignedMembers(
      church,
      requestManager,
      dto,
    );
  }

  @Get(':ministryGroupId')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getMinistryGroupById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.ministryGroupService.getMinistryGroupById(
      church,
      ministryGroupId,
    );
  }

  @Delete(':ministryGroupId')
  @MinistryWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  deleteMinistryGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('ministryGroupId', ParseIntPipe) ministryGroupId: number,
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.deleteMinistryGroup(
      church,
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
    @RequestChurch() church: ChurchModel,
    @Body() dto: UpdateMinistryGroupNameDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.updateMinistryGroupName(
      church,
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
    @RequestChurch() church: ChurchModel,
    @Body() dto: UpdateMinistryGroupStructureDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.updateMinistryGroupStructure(
      church,
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
    @RequestChurch() church: ChurchModel,
    @Body() dto: UpdateMinistryGroupLeaderDto,
    @QueryRunner() qr: QR,
  ) {
    return this.ministryGroupService.updateMinistryGroupLeader(
      church,
      ministryGroupId,
      dto,
      qr,
    );
  }
}
