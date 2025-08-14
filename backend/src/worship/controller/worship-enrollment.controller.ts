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
import { RequestChurch } from '../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';
import { WorshipReadScopeGuard } from '../guard/worship-read-scope.guard';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainName } from '../../permission/const/domain-name.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { PermissionScopeGroups } from '../decorator/permission-scope-groups.decorator';

@ApiTags('Worships:Enrollments')
@Controller(':worshipId/enrollments')
export class WorshipEnrollmentController {
  constructor(
    private readonly worshipEnrollmentService: WorshipEnrollmentService,
  ) {}

  @Get()
  //@WorshipReadGuard()
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
  getEnrollments(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Query() dto: GetWorshipEnrollmentsDto,
    @RequestChurch() church: ChurchModel,
    @RequestWorship() worship: WorshipModel,
    @PermissionScopeGroups() permissionScopeGroupIds?: number[],
  ) {
    return this.worshipEnrollmentService.getEnrollments(
      church,
      worship,
      dto,
      permissionScopeGroupIds,
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
    @QueryRunner() qr: QR,
  ) {
    return this.worshipEnrollmentService.refreshEnrollment(
      churchId,
      worshipId,
      qr,
    );
  }
}
