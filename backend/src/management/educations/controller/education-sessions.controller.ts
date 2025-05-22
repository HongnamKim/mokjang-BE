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
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { UpdateEducationSessionDto } from '../dto/sessions/request/update-education-session.dto';
import { EducationSessionService } from '../service/educaiton-session.service';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';
import { CreateEducationSessionDto } from '../dto/sessions/request/create-education-session.dto';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../churches/guard/church-guard.service';
import { AuthType } from '../../../auth/const/enum/auth-type.enum';
import { JwtAccessPayload } from '../../../auth/type/jwt';
import { Token } from '../../../auth/decorator/jwt.decorator';
import { GetEducationSessionDto } from '../dto/sessions/request/get-education-session.dto';
import { AddEducationSessionReportDto } from '../../../report/dto/education-report/session/request/add-education-session-report.dto';
import { DeleteEducationSessionReportDto } from '../../../report/dto/education-report/session/request/delete-education-session-report.dto';
import {
  ApiAddReportReceivers,
  ApiDeleteEducationSession,
  ApiDeleteReportReceivers,
  ApiGetEducationSessionById,
  ApiGetEducationSessions,
  ApiPatchEducationSession,
  ApiPostEducationSessions,
} from '../const/swagger/education-session.swagger';

@ApiTags('Management:Educations:Sessions')
@Controller('educations/:educationId/terms/:educationTermId/sessions')
export class EducationSessionsController {
  constructor(
    private readonly educationSessionsService: EducationSessionService,
  ) {}

  @ApiGetEducationSessions()
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
  @Post()
  @UseGuards(AccessTokenGuard, ChurchManagerGuard)
  @UseInterceptors(TransactionInterceptor)
  postEducationSession(
    @Token(AuthType.ACCESS) accessPayload: JwtAccessPayload,
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Body() dto: CreateEducationSessionDto,
    @QueryRunner() qr: QR,
  ) {
    const userId = accessPayload.id;

    return this.educationSessionsService.createSingleEducationSession(
      userId,
      churchId,
      educationId,
      educationTermId,
      dto,
      qr,
    );
  }

  @ApiGetEducationSessionById()
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
  @Patch(':educationSessionId')
  @UseInterceptors(TransactionInterceptor)
  patchEducationSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @Body() dto: UpdateEducationSessionDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationSessionsService.updateEducationSession(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      dto,
      qr,
    );
  }

  @ApiDeleteEducationSession()
  @Delete(':educationSessionId')
  @UseInterceptors(TransactionInterceptor)
  deleteEducationSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.educationSessionsService.deleteEducationSessions(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      qr,
    );
  }

  @ApiAddReportReceivers()
  @UseInterceptors(TransactionInterceptor)
  @Patch(':educationSessionId/add-receivers')
  addReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @Body() dto: AddEducationSessionReportDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationSessionsService.addReportReceivers(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      dto,
      qr,
    );
  }

  @ApiDeleteReportReceivers()
  @UseInterceptors(TransactionInterceptor)
  @Patch(':educationSessionId/delete-receivers')
  deleteReportReceivers(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @Body() dto: DeleteEducationSessionReportDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationSessionsService.deleteEducationSessionReportReceivers(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      dto,
      qr,
    );
  }
}
