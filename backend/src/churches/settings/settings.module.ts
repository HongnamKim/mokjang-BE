import { Module } from '@nestjs/common';
import { OfficersController } from './controller/officers.controller';
import { SettingsService } from './service/settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficerModel } from './entity/officer/officer.entity';
import { ChurchesModule } from '../churches.module';
import { RouterModule } from '@nestjs/core';
import { MinistriesController } from './controller/ministry/ministries.controller';
import { MinistryModel } from './entity/ministry/ministry.entity';
import { EducationsController } from './controller/education/educations.controller';
//import { EducationModel } from './entity/education.entity';
import { GroupModel } from './entity/group/group.entity';
import { GroupsController } from './controller/groups.controller';
import { GroupsService } from './service/groups.service';
import { MembersModule } from '../members/members.module';
import { GroupRoleModel } from './entity/group/group-role.entity';
import { GroupsRolesController } from './controller/groups-roles.controller';
import { GroupsRolesService } from './service/groups-roles.service';
import { EducationsService } from './service/educations.service';
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
import { MinistryService } from './service/ministry.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: SettingsModule,
      },
    ]),
    ChurchesModule,
    MembersModule,
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
      GroupModel,
      GroupRoleModel,
    ]),
  ],
  controllers: [
    OfficersController,
    MinistriesController,
    EducationsController,
    EducationTermsController,
    EducationEnrollmentsController,
    EducationSessionsController,
    SessionAttendanceController,
    GroupsController,
    GroupsRolesController,
  ],
  providers: [
    SettingsService,
    GroupsService,
    GroupsRolesService,
    EducationsService,
    MinistryService,
  ],
  exports: [
    SettingsService,
    MinistryService,
    GroupsService,
    EducationsService,
    GroupsRolesService,
  ],
})
export class SettingsModule {}
