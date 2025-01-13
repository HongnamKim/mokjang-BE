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
import { EducationsService } from '../../service/educations.service';
import { GetEducationTermDto } from '../../dto/education/terms/get-education-term.dto';
import { CreateEducationTermDto } from '../../dto/education/terms/create-education-term.dto';
import { UpdateEducationTermDto } from '../../dto/education/terms/update-education-term.dto';
import { TransactionInterceptor } from '../../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@ApiTags('Management:Educations:Terms')
@Controller('educations/:educationId/terms')
export class EducationTermsController {
  constructor(private readonly educationService: EducationsService) {}

  @ApiOperation({
    summary: '교육 기수 조회',
  })
  @Get()
  getEducationTerms(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Query() dto: GetEducationTermDto,
  ) {
    return this.educationService.getEducationTerms(churchId, educationId, dto);
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
    return this.educationService.createEducationTerm(
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
    return this.educationService.getEducationTermById(
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
    return this.educationService.updateEducationTerm(
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
    return this.educationService.deleteEducationTerm(
      educationId,
      educationTermId,
    );
  }
}
