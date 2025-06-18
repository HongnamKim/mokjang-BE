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

@ApiTags('Worships:Enrollments')
@Controller(':worshipId/enrollments')
export class WorshipEnrollmentController {
  constructor(
    private readonly worshipEnrollmentService: WorshipEnrollmentService,
  ) {}

  @Get()
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

  /*@Get(':enrollmentId')
  getEnrollmentById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {}*/

  /*@Patch(':enrollmentId')
  patchEnrollmentById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {}*/

  /*@Delete(':enrollmentId')
  deleteEnrollmentById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {}*/
}
