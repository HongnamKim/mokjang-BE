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
import { GetEducationTermDto } from '../dto/terms/request/get-education-term.dto';
import { CreateEducationTermDto } from '../dto/terms/request/create-education-term.dto';
import { UpdateEducationTermDto } from '../dto/terms/request/update-education-term.dto';
import { QueryRunner as QR } from 'typeorm';
import { EducationTermService } from '../service/education-term.service';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import {
  ApiDeleteEducationTerm,
  ApiGetEducationTermById,
  ApiGetEducationTerms,
  ApiPatchEducationTerm,
  ApiPostEducationTerms,
  ApiSyncAttendance,
} from '../const/swagger/education-term.swagger';
import { EducationReadGuard } from '../guard/education-read.guard';
import { EducationWriteGuard } from '../guard/education-write.guard';
import { PermissionManager } from '../../../permission/decorator/permission-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

@ApiTags('Management:Educations:Terms')
@Controller('educations/:educationId/terms')
export class EducationTermsController {
  constructor(private readonly educationTermService: EducationTermService) {}

  @ApiGetEducationTerms()
  @EducationReadGuard()
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

  @ApiPostEducationTerms()
  @EducationWriteGuard()
  @Post()
  //@UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @UseInterceptors(TransactionInterceptor)
  postEducationTerms(
    //@Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @PermissionManager() manager: ChurchUserModel,
    @Param('churchId', ParseIntPipe)
    churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Body() dto: CreateEducationTermDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationTermService.createEducationTerm(
      //accessPayload.id,
      manager,
      churchId,
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
