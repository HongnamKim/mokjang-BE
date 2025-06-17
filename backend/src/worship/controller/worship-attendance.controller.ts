import { Controller, Get } from '@nestjs/common';
import { WorshipAttendanceService } from '../service/worship-attendance.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Worships:Attendance')
@Controller(':worships/sessions/:sessionId/attendances')
export class WorshipAttendanceController {
  constructor(
    private readonly worshipAttendanceService: WorshipAttendanceService,
  ) {}

  @Get()
  getAttendances() {}
}
