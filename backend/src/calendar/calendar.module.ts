import { Module } from '@nestjs/common';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { RouterModule } from '@nestjs/core';
import { CalendarBirthdayController } from './controller/calendar-birthday.controller';
import { CalendarBirthdayService } from './service/calendar-birthday.service';
import { CalendarDomainModule } from './calendar-domain/calendar-domain.module';
import { ChurchEventService } from './service/church-event.service';
import { ChurchEventController } from './controller/church-event.controller';
import { CalendarEducationService } from './service/calendar-education.service';
import { CalendarEducationController } from './controller/calendar-education.controller';
import { EducationDomainModule } from '../educations/education-domain/education-domain.module';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/calendar', module: CalendarModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    CalendarDomainModule,
    EducationDomainModule,
  ],
  controllers: [
    CalendarBirthdayController,
    ChurchEventController,
    CalendarEducationController,
  ],
  providers: [
    CalendarBirthdayService,
    ChurchEventService,
    CalendarEducationService,
  ],
})
export class CalendarModule {}
