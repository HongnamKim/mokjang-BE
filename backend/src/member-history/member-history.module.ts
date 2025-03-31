import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { EducationEnrollmentModel } from '../management/educations/entity/education-enrollment.entity';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';
import { OfficersDomainModule } from '../management/officers/officer-domain/officers-domain.module';
import { MinistriesDomainModule } from '../management/ministries/ministries-domain/ministries-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MemberHistoryDomainModule } from './member-history-domain/member-history-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId', // 공통 prefix
        module: MemberHistoryModule,
      },
    ]),
    TypeOrmModule.forFeature([
      GroupHistoryModel,
      EducationEnrollmentModel,
      MinistryHistoryModel,
      //OfficerHistoryModel,
    ]),
    MembersDomainModule,
    GroupsDomainModule,
    OfficersDomainModule,
    MinistriesDomainModule,
    ChurchesDomainModule,

    MemberHistoryDomainModule,
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
export class MemberHistoryModule {}
