import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { EducationsService } from '../../service/education/educations.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionInterceptor } from '../../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm/query-runner/QueryRunner';
import { UpdateEducationSessionDto } from '../../dto/education/sessions/update-education-session.dto';

@ApiTags('Management:Educations:Sessions')
@Controller('educations/:educationId/terms/:educationTermId/sessions')
export class EducationSessionsController {
  constructor(private readonly educationsService: EducationsService) {}

  @ApiOperation({ summary: '교육 회차 조회' })
  @Get()
  getEducationSessions(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
  ) {
    return this.educationsService.getEducationSessions(educationTermId);
  }

  @ApiOperation({ summary: '교육 회차 생성' })
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postEducationSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.educationsService.createSingleEducationSession(
      educationId,
      educationTermId,
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
    return this.educationsService.getEducationSessionById(
      educationTermId,
      educationSessionId,
    );
  }

  @ApiOperation({ summary: '교육 진행 내용 업데이트' })
  @Patch(':educationSessionId')
  patchEducationSession(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @Body() dto: UpdateEducationSessionDto,
  ) {
    return this.educationsService.updateEducationSession(
      educationTermId,
      educationSessionId,
      dto,
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
    return this.educationsService.deleteEducationSessions(
      educationTermId,
      educationSessionId,
      qr,
      true,
    );
  }
}
