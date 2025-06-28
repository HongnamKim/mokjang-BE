import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { WorshipEnrollmentService } from '../service/worship-enrollment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetWorshipEnrollmentsDto } from '../dto/request/worship-enrollment/get-worship-enrollments.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { WorshipReadGuard } from '../guard/worship-read.guard';
import { WorshipWriteGuard } from '../guard/worship-write.guard';

@ApiTags('Worships:Enrollments')
@Controller(':worshipId/enrollments')
export class WorshipEnrollmentController {
  constructor(
    private readonly worshipEnrollmentService: WorshipEnrollmentService,
  ) {}

  @Get()
  @WorshipReadGuard()
  getEnrollments(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Query() dto: GetWorshipEnrollmentsDto,
  ) {
    return this.worshipEnrollmentService.getEnrollments(
      churchId,
      worshipId,
      dto,
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
