import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from '../members/members.module';
import { ManagementModule } from '../management/management.module';
import { MemberOfficerService } from './service/member-officer.service';
import { MemberOfficerController } from './controller/member-officer.controller';
import { RouterModule } from '@nestjs/core';
import { MemberMinistryService } from './service/member-ministry.service';
//import { EducationHistoryService } from './service/education-history.service';
import { EducationHistoryModel } from './entity/education-history.entity';
import { EducationHistoryController } from './controller/education-history.controller';
import { MemberGroupController } from './controller/member-group.controller';
import { GroupHistoryModel } from './entity/group-history.entity';
import { GroupHistoryService } from './service/group-history.service';
import { EducationEnrollmentModel } from '../management/entity/education/education-enrollment.entity';
import { EducationHistoryService } from './service/education-history.service';
import { MinistryHistoryModel } from './entity/ministry-history.entity';
import { MemberMinistryController } from './controller/member-ministry.controller';
import { OfficerHistoryModel } from './entity/officer-history.entity';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId', // 공통 prefix
        module: MembersSettingsModule,
      },
    ]),
    TypeOrmModule.forFeature([
      EducationHistoryModel,
      GroupHistoryModel,
      EducationEnrollmentModel,
      MinistryHistoryModel,
      OfficerHistoryModel,
    ]),
    MembersModule,
    ManagementModule,
  ],
  exports: [],
  providers: [
    MemberOfficerService,
    MemberMinistryService,
    EducationHistoryService,
    //MemberGroupService,
    GroupHistoryService,
  ],
  controllers: [
    MemberOfficerController,
    EducationHistoryController,
    MemberGroupController,
    MemberMinistryController,
  ],
})
export class MembersSettingsModule {}
