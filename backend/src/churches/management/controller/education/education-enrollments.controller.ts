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
import { EducationsService } from '../../service/education/educations.service';
import { CreateEducationEnrollmentDto } from '../../dto/education/enrollments/create-education-enrollment.dto';
import { GetEducationEnrollmentDto } from '../../dto/education/enrollments/get-education-enrollment.dto';
import { TransactionInterceptor } from '../../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateEducationEnrollmentDto } from '../../dto/education/enrollments/update-education-enrollment.dto';

@ApiTags('Management:Educations:Enrollments')
@Controller('educations/:educationId/terms/:educationTermId/enrollments')
export class EducationEnrollmentsController {
  constructor(private readonly educationsService: EducationsService) {}

  @Get()
  getEducationEnrollments(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Query() dto: GetEducationEnrollmentDto,
  ) {
    return this.educationsService.getEducationEnrollments(
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
    return this.educationsService.createEducationEnrollment(
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
    return this.educationsService.updateEducationEnrollment(
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
    return this.educationsService.deleteEducationEnrollment(
      churchId,
      educationId,
      educationTermId,
      educationEnrollmentId,
      qr,
    );
  }
}
