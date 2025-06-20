import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { WorshipAttendanceService } from '../service/worship-attendance.service';
import { ApiTags } from '@nestjs/swagger';
import { GetWorshipAttendancesDto } from '../dto/request/worship-attendance/get-worship-attendances.dto';

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
}
