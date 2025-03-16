import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from '../members/members.module';
import { MemberOfficerService } from './service/member-officer.service';
import { MemberOfficerController } from './controller/member-officer.controller';
import { RouterModule } from '@nestjs/core';
import { MemberMinistryService } from './service/member-ministry.service';
import { MemberEducationController } from './controller/member-education.controller';
import { MemberGroupController } from './controller/member-group.controller';
import { GroupHistoryModel } from './entity/group-history.entity';
import { MemberGroupService } from './service/member-group.service';
import { MemberEducationService } from './service/member-education.service';
import { MinistryHistoryModel } from './entity/ministry-history.entity';
import { MemberMinistryController } from './controller/member-ministry.controller';
import { OfficerHistoryModel } from './entity/officer-history.entity';
import { ManagementModule } from '../../management/management.module';
import { EducationEnrollmentModel } from '../../management/entity/education/education-enrollment.entity';
import { GroupsDomainModule } from '../../management/groups/groups-domain/groups-domain.module';
import { ChurchesDomainModule } from '../churches-domain/churches-domain.module';
import { OfficersModule } from '../../management/officers/officers.module';
import { MinistriesModule } from '../../management/ministries/ministries.module';
import { OfficersDomainModule } from '../../management/officers/officer-domain/officers-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId', // 공통 prefix
        module: MembersManagementModule,
      },
    ]),
    TypeOrmModule.forFeature([
      //EducationHistoryModel,
      GroupHistoryModel,
      EducationEnrollmentModel,
      MinistryHistoryModel,
      OfficerHistoryModel,
    ]),
    MembersModule,
    ManagementModule,
    //GroupsModule,
    // 임시 import
    OfficersModule,
    MinistriesModule,
    //
    GroupsDomainModule,
    OfficersDomainModule,
    ChurchesDomainModule,
  ],
  exports: [],
  providers: [
    MemberOfficerService,
    MemberMinistryService,
    MemberEducationService,
    MemberGroupService,
  ],
  controllers: [
    MemberOfficerController,
    MemberEducationController,
    MemberGroupController,
    MemberMinistryController,
  ],
})
export class MembersManagementModule {}
