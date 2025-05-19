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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Management:Educations:Sessions')
@Controller('educations/:educationId/terms/:educationTermId/sessions')
export class EducationSessionsController {
  constructor(
    private readonly educationSessionsService: EducationSessionService,
  ) {}

  @ApiOperation({ summary: '교육 회차 조회' })
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

  @ApiOperation({ summary: '교육 회차 생성' })
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

  @ApiOperation({ summary: '특정 교육 회차 조회' })
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

  @ApiOperation({ summary: '교육 진행 내용 업데이트' })
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

  @ApiOperation({
    summary: '교육 회차 삭제',
    description:
      '회차 삭제 시 다른 회차들의 넘버링 자동 수정, 해당 기수의 회차 개수 자동 수정',
  })
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
}
