import { Module } from '@nestjs/common';
import { EducationsService } from './service/educations.service';
import { EducationsController } from './controller/educations.controller';
import { EducationTermsController } from './controller/education-terms.controller';
import { EducationEnrollmentsController } from './controller/education-enrollments.controller';
import { EducationSessionsController } from './controller/education-sessions.controller';
import { SessionAttendanceController } from './controller/session-attendance.controller';
import { EducationSessionService } from './service/educaiton-session.service';
import { EducationEnrollmentService } from './service/education-enrollment.service';
import { EducationTermService } from './service/education-term.service';
import { SessionAttendanceService } from './service/session-attendance.service';
import { RouterModule } from '@nestjs/core';
import { MemberEducationEventHandler } from './service/member-education-event-handler.service';
import { EducationDomainModule } from './service/education-domain/education-domain.module';
import { EducationPermissionService } from './service/education-permission.service';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { EducationSessionReportDomainModule } from '../report/report-domain/education-session-report-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId', // 공통 prefix
        module: EducationsModule,
      },
    ]),
    //MembersModule,
    MembersDomainModule,
    ChurchesDomainModule,
    ManagerDomainModule,
    EducationDomainModule,

    EducationSessionReportDomainModule,
  ],
  controllers: [
    EducationsController,
    EducationTermsController,
    EducationEnrollmentsController,
    EducationSessionsController,
    SessionAttendanceController,
  ],
  providers: [
    // 교인 삭제 시 Enrollment 업데이트
    MemberEducationEventHandler,
    // 비즈니스 로직
    EducationsService,
    EducationSessionService,
    EducationEnrollmentService,
    EducationTermService,
    SessionAttendanceService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: EducationPermissionService,
    },
  ],
  exports: [],
})
export class EducationsModule {}
