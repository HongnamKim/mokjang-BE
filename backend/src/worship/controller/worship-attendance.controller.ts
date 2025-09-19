import {
  Body,
  Controller,
  Get,
  GoneException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorshipAttendanceService } from '../service/worship-attendance.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetWorshipAttendancesDto } from '../dto/request/worship-attendance/get-worship-attendances.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateWorshipAttendanceDto } from '../dto/request/worship-attendance/update-worship-attendance.dto';
import { WorshipReadGuard } from '../guard/worship-read.guard';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { WorshipScopeGuard } from '../guard/worship-scope.guard';
import { WorshipGroupFilterGuard } from '../guard/worship-group-filter.guard';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainName } from '../../permission/const/domain-name.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { WorshipAttendanceWriteScopeGuard } from '../guard/worship-attendance-write-scope.guard';
import { PermissionScopeGroups } from '../decorator/permission-scope-groups.decorator';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { RequestWorship } from '../decorator/request-worship.decorator';
import { WorshipModel } from '../entity/worship.entity';
import {
  ApiGetWorshipAttendance,
  ApiPatchAllAttended,
  ApiRefreshWorshipAttendance,
} from '../swagger/worship-attendance.swagger';
import { GetWorshipAttendanceListDto } from '../dto/request/worship-attendance/get-worship-attendance-list.dto';
import { WorshipTargetGroupIds } from '../decorator/worship-target-group-ids.decorator';
import { UpdateWorshipAllAttendedDto } from '../dto/request/worship-attendance/update-worship-all-attended.dto';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { DefaultWorshipGroupIds } from '../decorator/default-worship-group-ids.decorator';
import { WorshipGroupIdsVo } from '../vo/worship-group-ids.vo';
import { PermissionScopeIds } from '../decorator/permission-scope-ids.decorator';
import { PermissionScopeIdsVo } from '../../permission/vo/permission-scope-ids.vo';

@ApiTags('Worships:Attendance')
@Controller(':worshipId/sessions/:sessionId/attendances')
export class WorshipAttendanceController {
  constructor(
    private readonly worshipAttendanceService: WorshipAttendanceService,
  ) {}

  //@ApiGetWorshipAttendance()
  @ApiOperation({ deprecated: true })
  @Get()
  @UseGuards(
    AccessTokenGuard,
    ChurchManagerGuard,
    createDomainGuard(
      DomainType.WORSHIP_ATTENDANCE,
      DomainName.WORSHIP_ATTENDANCE,
      DomainAction.READ,
    ),
    WorshipGroupFilterGuard,
    WorshipScopeGuard,
  )
  @WorshipReadGuard()
  getAttendances(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query() dto: GetWorshipAttendancesDto,
    @RequestChurch() church: ChurchModel,
    @RequestWorship() worship: WorshipModel,
    @WorshipTargetGroupIds() defaultTargetGroupIds: number[],
    @PermissionScopeGroups() permissionScopeGroupIds: number[],
  ) {
    throw new GoneException('v2 사용');

    /*return this.worshipAttendanceService.getAttendances(
      church,
      worship,
      sessionId,
      dto,
      defaultTargetGroupIds,
      permissionScopeGroupIds,
    );*/
  }

  @Get('v2')
  @ApiGetWorshipAttendance()
  @UseGuards(
    AccessTokenGuard,
    ChurchManagerGuard,
    createDomainGuard(
      DomainType.WORSHIP_ATTENDANCE,
      DomainName.WORSHIP_ATTENDANCE,
      DomainAction.READ,
    ),
    WorshipGroupFilterGuard,
    WorshipScopeGuard,
  )
  getAttendanceList(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query() query: GetWorshipAttendanceListDto,
    @RequestChurch() church: ChurchModel,
    @RequestWorship() worship: WorshipModel,
    @DefaultWorshipGroupIds() defaultWorshipGroupIds: WorshipGroupIdsVo,
    @PermissionScopeIds() permissionScopeIds: PermissionScopeIdsVo,
  ) {
    return this.worshipAttendanceService.getAttendancesV2(
      church,
      worship,
      sessionId,
      query,
      defaultWorshipGroupIds,
      permissionScopeIds,
    );
  }

  @ApiRefreshWorshipAttendance()
  @Post('refresh')
  @UseGuards(
    AccessTokenGuard,
    ChurchManagerGuard,
    createDomainGuard(
      DomainType.WORSHIP_ATTENDANCE,
      DomainName.WORSHIP_ATTENDANCE,
      DomainAction.WRITE,
    ),
  )
  @UseInterceptors(TransactionInterceptor)
  refreshAttendance(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipAttendanceService.refreshAttendance(
      church,
      worshipId,
      sessionId,
      qr,
    );
  }

  @Patch('all-attended')
  @ApiPatchAllAttended()
  @UseGuards(
    AccessTokenGuard,
    ChurchManagerGuard,
    createDomainGuard(
      DomainType.WORSHIP_ATTENDANCE,
      DomainName.WORSHIP_ATTENDANCE,
      DomainAction.WRITE,
    ),
    WorshipGroupFilterGuard,
    WorshipScopeGuard,
  )
  @UseInterceptors(TransactionInterceptor)
  patchAllAttended(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: UpdateWorshipAllAttendedDto,
    @RequestChurch() church: ChurchModel,
    @RequestWorship() worship: WorshipModel,
    @DefaultWorshipGroupIds() defaultWorshipGroupIds: WorshipGroupIdsVo,
    @PermissionScopeIds() permissionScopeIds: PermissionScopeIdsVo,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipAttendanceService.patchAllAttended(
      church,
      worship,
      sessionId,
      dto,
      defaultWorshipGroupIds,
      permissionScopeIds,
      qr,
    );
  }

  @Patch(':attendanceId')
  @UseGuards(AccessTokenGuard, WorshipAttendanceWriteScopeGuard)
  @UseGuards(
    AccessTokenGuard,
    ChurchManagerGuard,
    createDomainGuard(
      DomainType.WORSHIP_ATTENDANCE,
      DomainName.WORSHIP_ATTENDANCE,
      DomainAction.WRITE,
    ),
    WorshipGroupFilterGuard,
    WorshipScopeGuard,
  )
  @UseInterceptors(TransactionInterceptor)
  patchAttendance(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('attendanceId', ParseIntPipe) attendanceId: number,
    @RequestWorship() worship: WorshipModel,
    @Body() dto: UpdateWorshipAttendanceDto,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipAttendanceService.patchAttendance(
      worship,
      sessionId,
      attendanceId,
      dto,
      qr,
    );
  }
}
