import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorshipEnrollmentService } from '../service/worship-enrollment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetWorshipEnrollmentsDto } from '../dto/request/worship-enrollment/get-worship-enrollments.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { WorshipWriteGuard } from '../guard/worship-write.guard';
import { WorshipGroupFilterGuard } from '../guard/worship-group-filter.guard';
import { RequestWorship } from '../decorator/request-worship.decorator';
import { WorshipModel } from '../entity/worship.entity';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { WorshipScopeGuard } from '../guard/worship-scope.guard';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainName } from '../../permission/const/domain-name.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { PermissionScopeGroups } from '../decorator/permission-scope-groups.decorator';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { WorshipTargetGroupIds } from '../decorator/worship-target-group-ids.decorator';

@ApiTags('Worships:Enrollments')
@Controller(':worshipId/enrollments')
export class WorshipEnrollmentController {
  constructor(
    private readonly worshipEnrollmentService: WorshipEnrollmentService,
  ) {}

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
  getEnrollments(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Query() dto: GetWorshipEnrollmentsDto,
    @RequestChurch() church: ChurchModel,
    @RequestWorship() worship: WorshipModel,
    @WorshipTargetGroupIds() defaultTargetGroupIds: number[], // 예배 대상 그룹
    @PermissionScopeGroups() permissionScopeGroupIds: number[], // 요청자의 권한 범위 내 그룹들
  ) {
    return this.worshipEnrollmentService.getEnrollments(
      church,
      worship,
      dto,
      permissionScopeGroupIds,
      defaultTargetGroupIds,
    );
  }

  @ApiOperation({
    summary: '예배 대상 교인 새로고침',
  })
  @Post('refresh')
  @WorshipWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postEnrollment(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipEnrollmentService.refreshEnrollment(
      churchId,
      worshipId,
      qr,
    );
  }
}
