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
import { EducationsService } from '../service/educations.service';
import { GetEducationDto } from '../dto/get-education.dto';
import {
  ApiDeleteEducation,
  ApiGetEducation,
  ApiGetEducationById,
  ApiGetInProgressEducations,
  ApiPatchEducation,
  ApiPostEducation,
  ApiRefreshEducationCount,
} from '../swagger/education.swagger';
import { CreateEducationDto } from '../dto/create-education.dto';
import { QueryRunner as QR } from 'typeorm';
import { UpdateEducationDto } from '../dto/update-education.dto';
import { EducationTermService } from '../../education-term/service/education-term.service';
import { GetInProgressEducationTermDto } from '../../education-term/dto/request/get-in-progress-education-term.dto';
import { EducationReadGuard } from '../../guard/education-read.guard';
import { EducationWriteGuard } from '../../guard/education-write.guard';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { RequestManager } from '../../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { RequestChurch } from '../../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';

@ApiTags('Educations')
@Controller('educations')
export class EducationsController {
  constructor(
    private readonly educationsService: EducationsService,
    private readonly educationTermService: EducationTermService,
  ) {}

  @ApiGetEducation()
  @EducationReadGuard()
  @Get()
  getEducations(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetEducationDto,
  ) {
    return this.educationsService.getEducations(churchId, dto);
  }

  @ApiPostEducation()
  @Post()
  @EducationWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  postEducation(
    @RequestManager() pm: ChurchUserModel,
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateEducationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationsService.createEducation(pm, churchId, dto, qr);
  }

  @ApiGetInProgressEducations()
  @Get('in-progress')
  @EducationReadGuard()
  getInProgressEducations(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetInProgressEducationTermDto,
  ) {
    return this.educationTermService.getInProgressEducationTerms(churchId, dto);
  }

  @ApiRefreshEducationCount()
  @Patch('refresh-count')
  @EducationWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  refreshEducationCount(
    @RequestChurch() church: ChurchModel,
    @QueryRunner() qr: QR,
  ) {
    return this.educationsService.refreshEducationCount(church, qr);
  }

  @ApiGetEducationById()
  @EducationReadGuard()
  @Get(':educationId')
  getEducationById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
  ) {
    return this.educationsService.getEducationById(churchId, educationId);
  }

  @ApiPatchEducation()
  @EducationWriteGuard()
  @Patch(':educationId')
  @UseInterceptors(TransactionInterceptor)
  patchEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Body() dto: UpdateEducationDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationsService.updateEducation(
      churchId,
      educationId,
      dto,
      qr,
    );
  }

  @ApiDeleteEducation()
  @EducationWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  @Delete(':educationId')
  deleteEducation(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.educationsService.deleteEducation(churchId, educationId, qr);
  }
}
