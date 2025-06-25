import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { WorshipController } from './controller/worship.controller';
import { WorshipSessionController } from './controller/worship-session.controller';
import { WorshipService } from './service/worship.service';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { WorshipAttendanceService } from './service/worship-attendance.service';
import { WorshipEnrollmentService } from './service/worship-enrollment.service';
import { WorshipSessionService } from './service/worship-session.service';
import { WorshipAttendanceController } from './controller/worship-attendance.controller';
import { WorshipEnrollmentController } from './controller/worship-enrollment.controller';
import { WorshipDomainModule } from './worship-domain/worship-domain.module';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/worships', module: WorshipModule },
    ]),
    ChurchesDomainModule,
    MembersDomainModule,
    WorshipDomainModule,
    GroupsDomainModule,
    ManagerDomainModule,
  ],
  controllers: [
    WorshipController,
    WorshipEnrollmentController,
    WorshipSessionController,
    WorshipAttendanceController,
  ],
  providers: [
    WorshipService,
    WorshipAttendanceService,
    WorshipEnrollmentService,
    WorshipSessionService,
  ],
})
export class WorshipModule {}
