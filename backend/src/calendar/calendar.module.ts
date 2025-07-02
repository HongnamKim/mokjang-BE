import { Module } from '@nestjs/common';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { RouterModule } from '@nestjs/core';
import { CalendarController } from './controller/calendar.controller';
import { CalendarService } from './service/calendar.service';
import { CalendarDomainModule } from './calendar-domain/calendar-domain.module';
import { ChurchEventService } from './service/church-event.service';
import { ChurchEventController } from './controller/church-event.controller';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/calendar', module: CalendarModule },
    ]),
    ChurchesDomainModule,
    MembersDomainModule,
    CalendarDomainModule,
  ],
  controllers: [CalendarController, ChurchEventController],
  providers: [CalendarService, ChurchEventService],
})
export class CalendarModule {}
