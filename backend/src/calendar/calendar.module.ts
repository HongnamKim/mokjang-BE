import { Module } from '@nestjs/common';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { RouterModule } from '@nestjs/core';
import { CalendarController } from './controller/calendar.controller';
import { CalendarService } from './service/calendar.service';
import { CalendarDomainModule } from './calendar-domain/calendar-domain.module';
import { ChurchEventService } from './service/church-event.service';
import { ChurchEventController } from './controller/church-event.controller';
import { CalendarEducationService } from './service/calendar-education.service';
import { CalendarEducationController } from './controller/calendar-education.controller';
import { EducationDomainModule } from '../management/educations/service/education-domain/education-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/calendar', module: CalendarModule },
    ]),
    ChurchesDomainModule,
    MembersDomainModule,
    CalendarDomainModule,
    EducationDomainModule,
  ],
  controllers: [
    CalendarController,
    ChurchEventController,
    CalendarEducationController,
  ],
  providers: [CalendarService, ChurchEventService, CalendarEducationService],
})
export class CalendarModule {}
