import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorshipAttendanceService } from '../service/worship-attendance.service';
import { ApiTags } from '@nestjs/swagger';
import { GetWorshipAttendancesDto } from '../dto/request/worship-attendance/get-worship-attendances.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateWorshipAttendanceDto } from '../dto/request/worship-attendance/update-worship-attendance.dto';
import { WorshipReadGuard } from '../guard/worship-read.guard';
import { WorshipWriteGuard } from '../guard/worship-write.guard';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { WorshipReadScopeGuard } from '../guard/worship-read-scope.guard';
import { WorshipTargetGroupGuard } from '../guard/worship-target-group.guard';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainName } from '../../permission/const/domain-name.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { WorshipAttendanceWriteScopeGuard } from '../guard/worship-attendance-write-scope.guard';
import { PermissionScopeGroups } from '../decorator/permission-scope-groups.decorator';
import { PermissionChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { RequestWorship } from '../decorator/request-worship.decorator';
import { WorshipModel } from '../entity/worship.entity';

@ApiTags('Worships:Attendance')
@Controller(':worshipId/sessions/:sessionId/attendances')
export class WorshipAttendanceController {
  constructor(
    private readonly worshipAttendanceService: WorshipAttendanceService,
  ) {}

  @Get()
  @UseGuards(
    AccessTokenGuard,
    createDomainGuard(
      DomainType.WORSHIP,
      DomainName.WORSHIP,
      DomainAction.READ,
    ),
    WorshipTargetGroupGuard,
    WorshipReadScopeGuard,
  )
  @WorshipReadGuard()
  getAttendances(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query() dto: GetWorshipAttendancesDto,
    @PermissionChurch() church: ChurchModel,
    @RequestWorship() worship: WorshipModel,
    @PermissionScopeGroups() permissionScopeGroupIds?: number[],
  ) {
    return this.worshipAttendanceService.getAttendances(
      church,
      worship,
      sessionId,
      dto,
      permissionScopeGroupIds,
    );
  }

  @Post('refresh')
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshAttendance(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipAttendanceService.refreshAttendance(
      churchId,
      worshipId,
      sessionId,
      qr,
    );
  }

  @Patch(':attendanceId')
  @UseGuards(AccessTokenGuard, WorshipAttendanceWriteScopeGuard)
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  patchAttendance(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('attendanceId', ParseIntPipe) attendanceId: number,
    @Body() dto: UpdateWorshipAttendanceDto,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipAttendanceService.patchAttendance(
      churchId,
      worshipId,
      sessionId,
      attendanceId,
      dto,
      qr,
    );
  }
}
