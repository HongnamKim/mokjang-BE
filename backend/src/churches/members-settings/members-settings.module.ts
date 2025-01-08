import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from '../members/members.module';
import { SettingsModule } from '../settings/settings.module';
import { MemberOfficerService } from './service/member-officer.service';
import { MemberSettingsController } from './controller/member-settings.controller';
import { RouterModule } from '@nestjs/core';
import { MemberMinistryService } from './service/member-ministry.service';
//import { EducationHistoryService } from './service/education-history.service';
import { EducationHistoryModel } from './entity/education-history.entity';
import { EducationHistoryController } from './controller/education-history.controller';
import { GroupHistoryController } from './controller/group-history.controller';
import { GroupHistoryModel } from './entity/group-history.entity';
import { GroupHistoryService } from './service/group-history.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId', // 공통 prefix
        module: MembersSettingsModule,
      },
    ]),
    TypeOrmModule.forFeature([EducationHistoryModel, GroupHistoryModel]),
    MembersModule,
    SettingsModule,
  ],
  exports: [],
  providers: [
    MemberOfficerService,
    MemberMinistryService,
    //EducationHistoryService,
    //MemberGroupService,
    GroupHistoryService,
  ],
  controllers: [
    MemberSettingsController,
    EducationHistoryController,
    GroupHistoryController,
  ],
})
export class MembersSettingsModule {}
