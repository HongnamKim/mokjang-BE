import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EducationsService } from '../../service/educations.service';
import { TransactionInterceptor } from '../../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateAttendanceDto } from '../../dto/education/attendance/update-attendance.dto';

@ApiTags('Management:Educations:Attendance')
@Controller(
  'educations/:educationId/terms/:educationTermId/sessions/:sessionId/attendance',
)
export class SessionAttendanceController {
  constructor(private readonly educationsService: EducationsService) {}

  @ApiOperation({
    summary: '교육 세션의 출석부 조회',
  })
  @Get()
  getSessionAttendances(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.educationsService.getSessionAttendance(sessionId);
  }

  @ApiOperation({
    summary: '교육 세션의 출석부 생성/새로고침',
  })
  @Post('create-table')
  @UseInterceptors(TransactionInterceptor)
  loadSessionAttendanceTable(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.educationsService.createSessionAttendance(
      educationTermId,
      sessionId,
      qr,
    );
  }

  @Patch(':attendanceId')
  @UseInterceptors(TransactionInterceptor)
  patchSessionAttendance(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('attendanceId', ParseIntPipe) attendanceId: number,
    @Body() dto: UpdateAttendanceDto,
    @QueryRunner() qr: QR,
  ) {
    return this.educationsService.updateSessionAttendance(
      sessionId,
      attendanceId,
      dto,
      qr,
    );
  }
}
