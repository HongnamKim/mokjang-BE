import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { EducationsController } from './controller/education/educations.controller';
import { EducationsService } from './service/education/educations.service';
import { EducationModel } from './entity/education/education.entity';
import { EducationEnrollmentModel } from './entity/education/education-enrollment.entity';
import { EducationSessionModel } from './entity/education/education-session.entity';
import { EducationTermModel } from './entity/education/education-term.entity';
import { SessionAttendanceModel } from './entity/education/session-attendance.entity';
import { EducationTermsController } from './controller/education/education-terms.controller';
import { EducationEnrollmentsController } from './controller/education/education-enrollments.controller';
import { EducationSessionsController } from './controller/education/education-sessions.controller';
import { SessionAttendanceController } from './controller/education/session-attendance.controller';
import { EducationSessionService } from './service/education/educaiton-session.service';
import { EducationEnrollmentService } from './service/education/education-enrollment.service';
import { EducationTermService } from './service/education/education-term.service';
import { SessionAttendanceService } from './service/education/session-attendance.service';
import { EducationTermSyncService } from './service/education-sync/education-term-sync.service';
import { EducationTermSessionSyncService } from './service/education-sync/education-term-session-sync.service';
import { EducationTermAttendanceSyncService } from './service/education-sync/education-term-attendance-sync.service';
import { EducationTermEnrollmentSyncService } from './service/education-sync/education-term-enrollment-sync.service';
import { EducationEnrollmentAttendanceSyncService } from './service/education-sync/education-enrollment-attendance-sync.service';
import { EducationEnrollmentSessionSyncService } from './service/education-sync/education-enrollment-session-sync.service';
import { MembersModule } from '../churches/members/members.module';
import { GroupsModule } from './groups/groups.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { OfficersModule } from './officers/officers.module';
import { MinistriesModule } from './ministries/ministries.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: ManagementModule,
      },
    ]),
    TypeOrmModule.forFeature([
      // 사역 관련 엔티티
      //MinistryModel,
      //MinistryGroupModel,
      // 교육 관련 엔티티
      EducationModel, // 교육
      EducationTermModel, // 교육 기수
      EducationEnrollmentModel, // 교육 등록 교인
      EducationSessionModel, // 교육 회차
      SessionAttendanceModel, // 교육 출석
    ]),
    ChurchesDomainModule,
    MembersModule,
    GroupsModule,
    OfficersModule,
    MinistriesModule,
  ],
  controllers: [
    //MinistryGroupsController,
    //MinistriesController,
    EducationsController,
    EducationTermsController,
    EducationEnrollmentsController,
    EducationSessionsController,
    SessionAttendanceController,
  ],
  providers: [
    EducationsService,
    EducationSessionService,
    EducationEnrollmentService,
    EducationTermService,
    SessionAttendanceService,
    EducationTermSyncService,
    EducationTermSessionSyncService,
    EducationTermAttendanceSyncService,
    EducationTermEnrollmentSyncService,
    EducationEnrollmentAttendanceSyncService,
    EducationEnrollmentSessionSyncService,
    /*MinistryService,
    MinistryGroupService,*/
  ],
  exports: [
    //MinistryService,
    //MinistryGroupService,
    EducationsService,
    EducationEnrollmentService,
  ],
})
export class ManagementModule {}
