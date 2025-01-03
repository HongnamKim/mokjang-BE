import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from '../members/members.module';
import { SettingsModule } from '../settings/settings.module';
import { MemberOfficerService } from './service/member-officer.service';
import { MemberSettingsController } from './controller/member-settings.controller';
import { RouterModule } from '@nestjs/core';
import { MemberMinistryService } from './service/member-ministry.service';
import { EducationHistoryService } from './service/education-history.service';
import { MemberGroupService } from './service/member-group.service';
import { EducationHistoryModel } from './entity/education-history.entity';
import { EducationHistoryController } from './controller/education-history.controller';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId', // 공통 prefix
        module: MembersSettingsModule,
      },
    ]),
    TypeOrmModule.forFeature([EducationHistoryModel]),
    MembersModule,
    SettingsModule,
  ],
  exports: [],
  providers: [
    MemberOfficerService,
    MemberMinistryService,
    EducationHistoryService,
    MemberGroupService,
  ],
  controllers: [MemberSettingsController, EducationHistoryController],
})
export class MembersSettingsModule {}
