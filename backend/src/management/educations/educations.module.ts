import { Module } from '@nestjs/common';
import { EducationsService } from './service/educations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationTermModel } from '../entity/education/education-term.entity';
import { EducationEnrollmentModel } from '../entity/education/education-enrollment.entity';
import { EducationSessionModel } from '../entity/education/education-session.entity';
import { SessionAttendanceModel } from '../entity/education/session-attendance.entity';
import { EducationsController } from './controller/educations.controller';
import { EducationTermsController } from './controller/education-terms.controller';
import { EducationEnrollmentsController } from './controller/education-enrollments.controller';
import { EducationSessionsController } from './controller/education-sessions.controller';
import { SessionAttendanceController } from './controller/session-attendance.controller';
import { EducationSessionService } from './service/educaiton-session.service';
import { EducationEnrollmentService } from './service/education-enrollment.service';
import { EducationTermService } from './service/education-term.service';
import { SessionAttendanceService } from './service/session-attendance.service';
import { EducationTermAttendanceSyncService } from './service/sync/education-term-attendance-sync.service';
import { EducationEnrollmentAttendanceSyncService } from './service/sync/education-enrollment-attendance-sync.service';
import { EducationEnrollmentSessionSyncService } from './service/sync/education-enrollment-session-sync.service';
import { RouterModule } from '@nestjs/core';
import { MembersModule } from '../../churches/members/members.module';
import { MemberEducationEventHandler } from './service/member-education-event-handler.service';
import { EducationDomainModule } from './service/education-domain/education-domain.module';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: EducationsModule,
      },
    ]),
    TypeOrmModule.forFeature([
      //EducationModel, // 교육
      EducationTermModel, // 교육 기수
      EducationEnrollmentModel, // 교육 등록 교인
      EducationSessionModel, // 교육 회차
      SessionAttendanceModel, // 교육 출석
    ]),
    MembersModule,
    ChurchesDomainModule,
    EducationDomainModule,
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
    //EducationTermSyncService,
    //EducationTermSessionSyncService,
    EducationTermAttendanceSyncService,
    //EducationTermEnrollmentSyncService,
    EducationEnrollmentAttendanceSyncService,
    EducationEnrollmentSessionSyncService,
  ],
  exports: [/*EducationsService,*/ EducationEnrollmentService],
})
export class EducationsModule {}
