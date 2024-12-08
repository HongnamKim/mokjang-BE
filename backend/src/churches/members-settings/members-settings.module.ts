import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from '../members/members.module';
import { SettingsModule } from '../settings/settings.module';
import { MemberOfficerService } from './service/member-officer.service';
import { MemberOfficerController } from './controller/member-officer.controller';
import { RouterModule } from '@nestjs/core';

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
  providers: [MemberOfficerService],
  controllers: [MemberOfficerController],
})
export class MembersSettingsModule {}
