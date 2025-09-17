import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CalendarEducationService } from '../service/calendar-education.service';
import { GetEducationSessionForCalendarDto } from '../dto/request/education/get-education-session-for-calendar.dto';
import { ApiTags } from '@nestjs/swagger';
import { EducationReadGuard } from '../../educations/guard/education-read.guard';
import { RequestChurch } from '../../permission/decorator/request-church.decorator';
import { ChurchModel } from '../../churches/entity/church.entity';

@ApiTags('Calendar:Educations')
@Controller('educations')
export class CalendarEducationController {
  constructor(
    private readonly calendarEducationService: CalendarEducationService,
  ) {}

  @Get()
  @EducationReadGuard()
  getEducationSessionsForCalendar(
    @Param('churchId', ParseIntPipe) churchId: number,
    @RequestChurch() church: ChurchModel,
    @Query() dto: GetEducationSessionForCalendarDto,
  ) {
    return this.calendarEducationService.getEducationSessionsForCalendar(
      church,
      dto,
    );
  }

  @Get(':educationSessionId')
  @EducationReadGuard()
  getEducationSessionById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('educationSessionId', ParseIntPipe) educationSessionId: number,
    @RequestChurch() church: ChurchModel,
  ) {
    return this.calendarEducationService.getEducationSessionById(
      church,
      educationSessionId,
    );
  }
}
