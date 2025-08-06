import { Module } from '@nestjs/common';
import { EducationsService } from './education/service/educations.service';
import { EducationsController } from './education/controller/educations.controller';
import { EducationTermsController } from './education-term/controller/education-terms.controller';
import { EducationEnrollmentsController } from './education-enrollment/controller/education-enrollments.controller';
import { EducationSessionsController } from './education-session/controller/education-sessions.controller';
import { SessionAttendanceController } from './session-attendance/controller/session-attendance.controller';
import { EducationSessionService } from './education-session/service/educaiton-session.service';
import { EducationEnrollmentService } from './education-enrollment/service/education-enrollment.service';
import { EducationTermService } from './education-term/service/education-term.service';
import { SessionAttendanceService } from './session-attendance/service/session-attendance.service';
import { RouterModule } from '@nestjs/core';
import { MemberEducationEventHandler } from './education-enrollment/service/member-education-event-handler.service';
import { EducationDomainModule } from './education-domain/education-domain.module';
import { EducationPermissionService } from './guard/education-permission.service';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { EducationReportDomainModule } from '../report/report-domain/education-report-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId', // 공통 prefix
        module: EducationsModule,
      },
    ]),
    MembersDomainModule,
    ChurchesDomainModule,
    ManagerDomainModule,
    EducationDomainModule,

    EducationReportDomainModule,
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
