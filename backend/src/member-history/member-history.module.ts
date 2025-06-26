import { Module } from '@nestjs/common';
import { OfficerHistoryService } from './service/officer-history.service';
import { OfficerHistoryController } from './controller/officer-history.controller';
import { RouterModule } from '@nestjs/core';
import { MinistryHistoryService } from './service/ministry-history.service';
import { EducationHistoryController } from './controller/education-history.controller';
import { GroupHistoryController } from './controller/group-history.controller';
import { GroupHistoryService } from './service/group-history.service';
import { EducationHistoryService } from './service/education-history.service';
import { MinistryHistoryController } from './controller/ministry-history.controller';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';
import { OfficersDomainModule } from '../management/officers/officer-domain/officers-domain.module';
import { MinistriesDomainModule } from '../management/ministries/ministries-domain/ministries-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MemberHistoryDomainModule } from './member-history-domain/member-history-domain.module';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';
import { HistoryPermissionService } from './service/history-permission.service';
import { IMEMBER_FILTER_SERVICE } from '../members/service/interface/member-filter.service.interface';
import { MemberFilterService } from '../members/service/member-filter.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId', // 공통 prefix
        module: MemberHistoryModule,
      },
    ]),
    MembersDomainModule,
    GroupsDomainModule,
    OfficersDomainModule,
    MinistriesDomainModule,
    ChurchesDomainModule,
    ManagerDomainModule,

    MemberHistoryDomainModule,
  ],
  exports: [],
  providers: [
    OfficerHistoryService,
    MinistryHistoryService,
    EducationHistoryService,
    GroupHistoryService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: HistoryPermissionService,
    },
    {
      provide: IMEMBER_FILTER_SERVICE,
      useClass: MemberFilterService,
    },
  ],
  controllers: [
    OfficerHistoryController,
    EducationHistoryController,
    GroupHistoryController,
    MinistryHistoryController,
  ],
})
export class MemberHistoryModule {}
