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
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { UpdateEducationSessionDto } from '../dto/request/update-education-session.dto';
import { EducationSessionService } from '../service/educaiton-session.service';
import { CreateEducationSessionDto } from '../dto/request/create-education-session.dto';
import { GetEducationSessionDto } from '../dto/request/get-education-session.dto';
import {
  ApiAddReportReceivers,
  ApiDeleteEducationSession,
  ApiDeleteReportReceivers,
  ApiGetEducationSessionById,
  ApiGetEducationSessions,
  ApiPatchEducationSession,
  ApiPostEducationSessions,
} from '../swagger/education-session.swagger';
import { EducationReadGuard } from '../../guard/education-read.guard';
import { EducationWriteGuard } from '../../guard/education-write.guard';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { RequestManager } from '../../../permission/decorator/request-manager.decorator';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { AddEducationSessionReportDto } from '../../../report/education-report/dto/session/request/add-education-session-report.dto';
import { DeleteEducationSessionReportDto } from '../../../report/education-report/dto/session/request/delete-education-session-report.dto';
import { RequestChurch } from '../../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../../churches/entity/church.entity';

@ApiTags('Educations:Sessions')
@Controller('educations/:educationId/terms/:educationTermId/sessions')
export class EducationSessionsController {
  constructor(
    private readonly educationSessionsService: EducationSessionService,
  ) {}

  @ApiGetEducationSessions()
  @EducationReadGuard()
  @Get()
  getEducationSessions(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Query() dto: GetEducationSessionDto,
  ) {
    return this.educationSessionsService.getEducationSessions(
      churchId,
      educationId,
      educationTermId,
      dto,
    );
  }

  @ApiPostEducationSessions()
  @EducationWriteGuard()
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postEducationSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: CreateEducationSessionDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationSessionsService.createEducationSession(
      church,
      requestManager,
      educationId,
      educationTermId,
      dto,
      qr,
    );
  }

  @ApiGetEducationSessionById()
  @EducationReadGuard()
  @Get(':educationSessionId')
  getEducationSessionById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
  ) {
    return this.educationSessionsService.getEducationSessionById(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
    );
  }

  @ApiPatchEducationSession()
  @EducationWriteGuard()
  @Patch(':educationSessionId')
  @UseInterceptors(TransactionInterceptor)
  patchEducationSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: UpdateEducationSessionDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationSessionsService.updateEducationSession(
      church,
      requestManager,
      educationId,
      educationTermId,
      educationSessionId,
      dto,
      qr,
    );
  }

  @ApiDeleteEducationSession()
  @EducationWriteGuard()
  @Delete(':educationSessionId')
  @UseInterceptors(TransactionInterceptor)
  deleteEducationSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @QueryRunner() qr: QR,
  ) {
    return this.educationSessionsService.deleteEducationSessions(
      church,
      requestManager,
      educationId,
      educationTermId,
      educationSessionId,
      qr,
    );
  }

  @ApiAddReportReceivers()
  @EducationWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  @Patch(':educationSessionId/add-receivers')
  addReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: AddEducationSessionReportDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationSessionsService.addReportReceivers(
      church,
      requestManager,
      educationId,
      educationTermId,
      educationSessionId,
      dto,
      qr,
    );
  }

  @ApiDeleteReportReceivers()
  @EducationWriteGuard()
  @UseInterceptors(TransactionInterceptor)
  @Patch(':educationSessionId/delete-receivers')
  deleteReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @RequestChurch() church: ChurchModel,
    @RequestManager() requestManager: ChurchUserModel,
    @Body() dto: DeleteEducationSessionReportDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationSessionsService.deleteEducationSessionReportReceivers(
      church,
      requestManager,
      educationId,
      educationTermId,
      educationSessionId,
      dto,
      qr,
    );
  }
}
