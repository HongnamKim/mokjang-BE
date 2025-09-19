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
import { CreateEducationEnrollmentDto } from '../dto/request/create-education-enrollment.dto';
import { GetEducationEnrollmentDto } from '../dto/request/get-education-enrollment.dto';
import { QueryRunner as QR } from 'typeorm';
import { UpdateEducationEnrollmentDto } from '../dto/request/update-education-enrollment.dto';
import { EducationEnrollmentService } from '../service/education-enrollment.service';
import { EducationReadGuard } from '../../guard/education-read.guard';
import { EducationWriteGuard } from '../../guard/education-write.guard';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { GetNotEnrolledMembersDto } from '../dto/request/get-not-enrolled-members.dto';
import { RequestChurch } from '../../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { RequestManager } from '../../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';
import { UseTransaction } from '../../../common/decorator/use-transaction.decorator';

@ApiTags('Educations:Enrollments')
@Controller('educations/:educationId/terms/:educationTermId/enrollments')
export class EducationEnrollmentsController {
  constructor(
    private readonly educationEnrollmentsService: EducationEnrollmentService,
  ) {}

  @EducationReadGuard()
  @Get()
  getEducationEnrollments(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Query() dto: GetEducationEnrollmentDto,
  ) {
    return this.educationEnrollmentsService.getEducationEnrollments(
      church,
      requestManager,
      educationId,
      educationTermId,
      dto,
    );
  }

  @EducationWriteGuard()
  @Post()
  @UseTransaction()
  postEducationEnrollment(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Body()
    dto: CreateEducationEnrollmentDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationEnrollmentsService.createEducationEnrollment(
      requestManager,
      church,
      educationId,
      educationTermId,
      dto,
      qr,
    );
  }

  @Get('not-enrolled-members')
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  getNotEnrolledMembers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Query() dto: GetNotEnrolledMembersDto,
  ) {
    return this.educationEnrollmentsService.getNotEnrolledMembers(
      church,
      requestManager,
      educationId,
      educationTermId,
      dto,
    );
  }

  @EducationWriteGuard()
  @Patch(':educationEnrollmentId')
  @UseInterceptors(TransactionInterceptor)
  patchEducationEnrollment(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationEnrollmentId', ParseIntPipe) educationEnrollmentId: number,
    @RequestChurch() church: ChurchModel,
    @Body() dto: UpdateEducationEnrollmentDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationEnrollmentsService.updateEducationEnrollment(
      church,
      educationId,
      educationTermId,
      educationEnrollmentId,
      dto.status,
      qr,
    );
  }

  @EducationWriteGuard()
  @Delete(':educationEnrollmentId')
  @UseInterceptors(TransactionInterceptor)
  deleteEducationEnrollment(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationEnrollmentId', ParseIntPipe) educationEnrollmentId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @QueryRunner() qr: QR,
  ) {
    return this.educationEnrollmentsService.deleteEducationEnrollment(
      requestManager,
      church,
      educationId,
      educationTermId,
      educationEnrollmentId,
      qr,
    );
  }
}
