import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from '../members/members.module';
import { SettingsModule } from '../settings/settings.module';
import { MemberOfficerService } from './service/member-officer.service';
import { MemberSettingsController } from './controller/member-settings.controller';
import { RouterModule } from '@nestjs/core';
import { MemberMinistryService } from './service/member-ministry.service';
import { MemberEducationService } from './service/member-education.service';
import { MemberGroupService } from './service/member-group.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId/settings', // 공통 prefix
        module: MembersSettingsModule,
      },
    ]),
    TypeOrmModule.forFeature([]),
    MembersModule,
    SettingsModule,
  ],
  exports: [],
  providers: [
    MemberOfficerService,
    MemberMinistryService,
    MemberEducationService,
    MemberGroupService,
  ],
  controllers: [MemberSettingsController],
})
export class MembersSettingsModule {}
