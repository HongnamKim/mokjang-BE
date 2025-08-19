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
import { WorshipService } from '../service/worship.service';
import { GetWorshipsDto } from '../dto/request/worship/get-worships.dto';
import { CreateWorshipDto } from '../dto/request/worship/create-worship.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateWorshipDto } from '../dto/request/worship/update-worship.dto';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { RequestChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { WorshipWriteGuard } from '../guard/worship-write.guard';
import { WorshipReadGuard } from '../guard/worship-read.guard';
import { GetWorshipStatsDto } from '../dto/request/worship/get-worship-stats.dto';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainName } from '../../permission/const/domain-name.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { WorshipGroupFilterGuard } from '../guard/worship-group-filter.guard';
import { WorshipReadScopeGuard } from '../guard/worship-read-scope.guard';
import { RequestWorship } from '../decorator/request-worship.decorator';
import { WorshipModel } from '../entity/worship.entity';
import { WorshipTargetGroupIds } from '../decorator/worship-target-group-ids.decorator';
import {
  ApiDeleteWorship,
  ApiGetWorshipById,
  ApiGetWorships,
  ApiGetWorshipStatistics,
  ApiPatchWorship,
  ApiPostWorship,
  ApiRefreshWorshipCount,
} from '../swagger/worship.swagger';
import { PermissionScopeGroups } from '../decorator/permission-scope-groups.decorator';

@ApiTags('Worships')
@Controller()
export class WorshipController {
  constructor(private readonly worshipService: WorshipService) {}

  @ApiGetWorships()
  @Get()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getWorships(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetWorshipsDto,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.worshipService.findWorships(church, dto);
  }

  @ApiPostWorship()
  @Post()
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postWorship(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateWorshipDto,
    @QueryRunner() qr: QR,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.worshipService.postWorship(church, dto, qr);
  }

  @ApiRefreshWorshipCount()
  @Patch('refresh-count')
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshWorshipCount(
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipService.refreshWorshipCount(church, qr);
  }

  @ApiGetWorshipById()
  @Get(':worshipId')
  @WorshipReadGuard()
  getWorshipById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('worshipId', ParseIntPipe) worshipId: number,
  ) {
    return this.worshipService.findWorshipById(church, worshipId);
  }

  @ApiPatchWorship()
  @Patch(':worshipId')
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchWorshipById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Body() dto: UpdateWorshipDto,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipService.patchWorshipById(church, worshipId, dto, qr);
  }

  @ApiDeleteWorship()
  @Delete(':worshipId')
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  DeleteWorshipById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipService.deleteWorshipById(church, worshipId, qr);
  }

  @ApiGetWorshipStatistics()
  @Get(':worshipId/statistics')
  @UseGuards(
    AccessTokenGuard,
    createDomainGuard(
      DomainType.WORSHIP,
      DomainName.WORSHIP,
      DomainAction.READ,
    ),
    WorshipGroupFilterGuard,
    WorshipReadScopeGuard,
  )
  getWorshipStatistics(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @RequestChurch() church: ChurchModel,
    @RequestWorship() worship: WorshipModel,
    @WorshipTargetGroupIds() defaultTargetGroupIds: number[] | undefined,
    @PermissionScopeGroups() permissionScopeGroupIds: number[] | undefined,
    @Query() dto: GetWorshipStatsDto,
  ) {
    return this.worshipService.getWorshipStatistics(
      church,
      worship,
      defaultTargetGroupIds,
      permissionScopeGroupIds,
      dto.groupId,
    );
  }
}
