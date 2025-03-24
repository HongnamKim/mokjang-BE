import {
  Body,
  Controller,
  Get,
  GoneException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EducationsService } from '../service/educations.service';
import { QueryRunner as QR } from 'typeorm';
import { UpdateAttendanceDto } from '../dto/attendance/update-attendance.dto';
import { GetAttendanceDto } from '../dto/attendance/get-attendance.dto';
import {
  ApiGetSessionAttendance,
  ApiLoadSessionAttendance,
  ApiPatchSessionAttendance,
} from '../swagger/session-attendance/controller.swagger';
import { SessionAttendanceService } from '../service/session-attendance.service';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';

@ApiTags('Management:Educations:Attendance')
@Controller(
  'educations/:educationId/terms/:educationTermId/sessions/:sessionId/attendance',
)
export class SessionAttendanceController {
  constructor(
    private readonly educationsService: EducationsService,
    private readonly sessionAttendanceService: SessionAttendanceService,
  ) {}

  @ApiGetSessionAttendance()
  @Get()
  getSessionAttendances(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query() dto: GetAttendanceDto,
  ) {
    return this.sessionAttendanceService.getSessionAttendance(
      churchId,
      educationId,
      educationTermId,
      sessionId,
      dto,
    );
    /*return this.educationsService.getSessionAttendance(
      churchId,
      educationId,
      educationTermId,
      sessionId,
      dto,
    );*/
  }

  @ApiLoadSessionAttendance()
  @Post('create-table')
  @UseInterceptors(TransactionInterceptor)
  loadSessionAttendanceTable(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationId', ParseIntPipe) educationId: number,
    @Param('educationTermId', ParseIntPipe) educationTermId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @QueryRunner() qr: QR,
  ) {
    throw new GoneException('이 엔드포인트는 더 이상 지원되지 않습니다.');
    /*return this.educationsService.createSessionAttendance(
      educationTermId,
      sessionId,
      qr,
    );*/
  }

  @ApiPatchSessionAttendance()
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
    return this.sessionAttendanceService.updateSessionAttendance(
      churchId,
      educationId,
      educationTermId,
      sessionId,
      attendanceId,
      dto,
      qr,
    );
    /*return this.educationsService.updateSessionAttendance(
      churchId,
      educationId,
      educationTermId,
      sessionId,
      attendanceId,
      dto,
      qr,
    );*/
  }
}
