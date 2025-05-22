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
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEducationEnrollmentDto } from '../dto/enrollments/create-education-enrollment.dto';
import { GetEducationEnrollmentDto } from '../dto/enrollments/get-education-enrollment.dto';
import { QueryRunner as QR } from 'typeorm';
import { UpdateEducationEnrollmentDto } from '../dto/enrollments/update-education-enrollment.dto';
import { EducationEnrollmentService } from '../service/education-enrollment.service';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';

@ApiTags('Management:Educations:Enrollments')
@Controller('educations/:educationId/terms/:educationTermId/enrollments')
export class EducationEnrollmentsController {
  constructor(
    private readonly educationEnrollmentsService: EducationEnrollmentService,
  ) {}

  @Get()
  getEducationEnrollments(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Query() dto: GetEducationEnrollmentDto,
  ) {
    return this.educationEnrollmentsService.getEducationEnrollments(
      churchId,
      educationId,
      educationTermId,
      dto,
    );
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  postEducationEnrollment(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Body() dto: CreateEducationEnrollmentDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationEnrollmentsService.createEducationEnrollment(
      churchId,
      educationId,
      educationTermId,
      dto,
      qr,
    );
  }

  @Patch(':educationEnrollmentId')
  @UseInterceptors(TransactionInterceptor)
  patchEducationEnrollment(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationEnrollmentId', ParseIntPipe) educationEnrollmentId: number,
    @Body() dto: UpdateEducationEnrollmentDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationEnrollmentsService.updateEducationEnrollment(
      churchId,
      educationId,
      educationTermId,
      educationEnrollmentId,
      dto,
      qr,
    );
  }

  @Delete(':educationEnrollmentId')
  @UseInterceptors(TransactionInterceptor)
  deleteEducationEnrollment(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationEnrollmentId', ParseIntPipe) educationEnrollmentId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.educationEnrollmentsService.deleteEducationEnrollment(
      churchId,
      educationId,
      educationTermId,
      educationEnrollmentId,
      qr,
    );
  }
}
