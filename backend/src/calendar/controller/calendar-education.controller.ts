import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CalendarEducationService } from '../service/calendar-education.service';
import { GetEducationSessionForCalendarDto } from '../dto/request/education/get-education-session-for-calendar.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Calendar:Educations')
@Controller('educations')
export class CalendarEducationController {
  constructor(
    private readonly calendarEducationService: CalendarEducationService,
  ) {}

  @Get()
  getEducationSessionsForCalendar(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Query() dto: GetEducationSessionForCalendarDto,
  ) {
    return this.calendarEducationService.getEducationSessionsForCalendar(
      churchId,
      dto,
    );
  }

  @Get(':educationSessionId')
  getEducationSessionById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
  ) {
    return this.calendarEducationService.getEducationSessionById(
      churchId,
      educationSessionId,
    );
  }
}
