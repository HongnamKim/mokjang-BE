import { Module } from '@nestjs/common';
import { OfficersController } from './controller/officer/officers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficerModel } from './entity/officer/officer.entity';
import { RouterModule } from '@nestjs/core';
import { MinistriesController } from './controller/ministry/ministries.controller';
import { MinistryModel } from './entity/ministry/ministry.entity';
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
import { MinistryGroupModel } from './entity/ministry/ministry-group.entity';
import { MinistryService } from './service/ministry/ministry.service';
import { MinistryGroupService } from './service/ministry/ministry-group.service';
import { MinistryGroupsController } from './controller/ministry/ministry-groups.controller';
import { OfficersService } from './service/officer/officers.service';
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
import { GroupDomainModule } from './group/group-management-domain/group-domain.module';
import { GroupsModule } from './group/groups.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: ManagementModule,
      },
    ]),
    TypeOrmModule.forFeature([
      OfficerModel,
      // 사역 관련 엔티티
      MinistryModel,
      MinistryGroupModel,
      // 교육 관련 엔티티
      EducationModel, // 교육
      EducationTermModel, // 교육 기수
      EducationEnrollmentModel, // 교육 등록 교인
      EducationSessionModel, // 교육 회차
      SessionAttendanceModel, // 교육 출석
      // 그룹 관련 엔티티
      //GroupModel,
      //GroupRoleModel,
    ]),
    //ChurchesModule,
    ChurchesDomainModule,
    MembersModule,
    GroupsModule,
    GroupDomainModule,
  ],
  controllers: [
    OfficersController,
    MinistryGroupsController,
    MinistriesController,
    EducationsController,
    EducationTermsController,
    EducationEnrollmentsController,
    EducationSessionsController,
    SessionAttendanceController,
    //GroupsController,
    //GroupsRolesController,
  ],
  providers: [
    OfficersService,
    //GroupsService,
    //GroupRolesService,
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
    MinistryService,
    MinistryGroupService,
  ],
  exports: [
    MinistryService,
    MinistryGroupService,
    //GroupsService,
    //GroupRolesService,
    EducationsService,
    //EducationSessionService,
    EducationEnrollmentService,
    //EducationTermService,
    //SessionAttendanceService,
    OfficersService,
  ],
})
export class ManagementModule {}
