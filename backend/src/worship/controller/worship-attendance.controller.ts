import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { WorshipAttendanceService } from '../service/worship-attendance.service';
import { ApiTags } from '@nestjs/swagger';
import { GetWorshipAttendancesDto } from '../dto/request/worship-attendance/get-worship-attendances.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { UpdateWorshipAttendanceDto } from '../dto/request/worship-attendance/update-worship-attendance.dto';

@ApiTags('Worships:Attendance')
@Controller(':worshipId/sessions/:sessionId/attendances')
export class WorshipAttendanceController {
  constructor(
    private readonly worshipAttendanceService: WorshipAttendanceService,
  ) {}

  @Get()
  getAttendances(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query() dto: GetWorshipAttendancesDto,
  ) {
    return this.worshipAttendanceService.getAttendances(
      churchId,
      worshipId,
      sessionId,
      dto,
    );
  }

  @Post('refresh')
  @UseInterceptors(TransactionInterceptor)
  refreshAttendance(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipAttendanceService.refreshAttendance(
      churchId,
      worshipId,
      sessionId,
      qr,
    );
  }

  @Patch(':attendanceId')
  @UseInterceptors(TransactionInterceptor)
  patchAttendance(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('worshipId', ParseIntPipe) worshipId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('attendanceId', ParseIntPipe) attendanceId: number,
    @Body() dto: UpdateWorshipAttendanceDto,
    @QueryRunner() qr: QR,
  ) {
    return this.worshipAttendanceService.patchAttendance(
      churchId,
      worshipId,
      sessionId,
      attendanceId,
      dto,
      qr,
    );
  }
}
