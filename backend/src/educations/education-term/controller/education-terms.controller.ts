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
import { GetEducationTermDto } from '../dto/request/get-education-term.dto';
import { CreateEducationTermDto } from '../dto/request/create-education-term.dto';
import { UpdateEducationTermDto } from '../dto/request/update-education-term.dto';
import { QueryRunner as QR } from 'typeorm';
import { EducationTermService } from '../service/education-term.service';
import {
  ApiDeleteEducationTerm,
  ApiGetEducationTermById,
  ApiGetEducationTerms,
  ApiPatchEducationTerm,
  ApiPostEducationTerms,
  ApiSyncAttendance,
} from '../swagger/education-term.swagger';
import { EducationReadGuard } from '../../guard/education-read.guard';
import { EducationWriteGuard } from '../../guard/education-write.guard';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { PermissionManager } from '../../../permission/decorator/permission-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { PermissionChurch } from '../../../permission/decorator/permission-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';

@ApiTags('Educations:Terms')
@Controller('educations/:educationId/terms')
export class EducationTermsController {
  constructor(private readonly educationTermService: EducationTermService) {}

  @ApiGetEducationTerms()
  @EducationReadGuard()
  @Get()
  getEducationTerms(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @PermissionChurch() church: ChurchModel,
    @Query() dto: GetEducationTermDto,
  ) {
    return this.educationTermService.getEducationTerms(
      church,
      educationId,
      dto,
    );
  }

  @ApiPostEducationTerms()
  @EducationWriteGuard()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postEducationTerms(
    @PermissionManager() manager: ChurchUserModel,
    @PermissionChurch() church: ChurchModel,
    @Param('churchId', ParseIntPipe)
    churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Body() dto: CreateEducationTermDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationTermService.createEducationTerm(
      manager,
      church,
      educationId,
      dto,
      qr,
    );
  }

  @ApiGetEducationTermById()
  @EducationReadGuard()
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

  @ApiPatchEducationTerm()
  @EducationWriteGuard()
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

  @ApiDeleteEducationTerm()
  @EducationWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  @Delete(':educationTermId')
  async deleteEducationTerm(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.educationTermService.deleteEducationTerm(
      churchId,
      educationId,
      educationTermId,
      qr,
    );
  }

  @ApiSyncAttendance()
  @EducationWriteGuard()
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
