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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetEducationTermDto } from '../dto/terms/get-education-term.dto';
import { CreateEducationTermDto } from '../dto/terms/create-education-term.dto';
import { UpdateEducationTermDto } from '../dto/terms/update-education-term.dto';
import { QueryRunner as QR } from 'typeorm';
import { EducationTermService } from '../service/education-term.service';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';

@ApiTags('Management:Educations:Terms')
@Controller('educations/:educationId/terms')
export class EducationTermsController {
  constructor(private readonly educationTermService: EducationTermService) {}

  @ApiOperation({
    summary: '교육 기수 조회',
  })
  @Get()
  getEducationTerms(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Query() dto: GetEducationTermDto,
  ) {
    return this.educationTermService.getEducationTerms(
      churchId,
      educationId,
      dto,
    );
  }

  @ApiOperation({
    summary: '교육 기수 생성',
  })
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postEducationTerms(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Body() dto: CreateEducationTermDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationTermService.createEducationTerm(
      churchId,
      educationId,
      dto,
      qr,
    );
  }

  @ApiOperation({
    summary: '특정 기수 조회',
  })
  @Get(':educationTermId')
  getEducationTermById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
  ) {
    return this.educationTermService.getEducationTermById(
      churchId,
      educationId,
      educationTermId,
    );
  }

  @ApiOperation({
    summary: '교육 기수 수정',
  })
  @Patch(':educationTermId')
  @UseInterceptors(TransactionInterceptor)
  patchEducationTerm(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Body() dto: UpdateEducationTermDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationTermService.updateEducationTerm(
      churchId,
      educationId,
      educationTermId,
      dto,
      qr,
    );
  }

  @ApiOperation({ summary: '교육 기수 삭제' })
  @Delete(':educationTermId')
  deleteEducationTerm(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
  ) {
    return this.educationTermService.deleteEducationTerm(
      churchId,
      educationId,
      educationTermId,
    );
  }

  @ApiOperation({
    summary: '교육 기수의 출석 정보 동기화',
    description:
      '<p><h2>해당 기수의 누락된 출석 정보를 동기화합니다.</h2></p>' +
      '<p>누락된 출석 정보가 없을 경우 BadRequestException</p>',
  })
  @Post(':educationTermId/sync-attendance')
  @UseInterceptors(TransactionInterceptor)
  syncAttendance(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.educationTermService.syncSessionAttendances(
      churchId,
      educationId,
      educationTermId,
      qr,
    );
  }
}
