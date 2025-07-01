import { Module } from '@nestjs/common';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { RouterModule } from '@nestjs/core';
import { CalendarController } from './controller/calendar.controller';
import { CalendarService } from './service/calendar.service';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/calendar', module: CalendarModule },
    ]),
    ChurchesDomainModule,
    MembersDomainModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
