import { Module } from '@nestjs/common';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { MinistriesDomainModule } from '../../management/ministries/ministries-domain/ministries-domain.module';
import { MinistryGroupHistoryController } from './controller/ministry-group-history.controller';
import { MinistryHistoryController } from './controller/ministry-history.controller';
import { MinistryHistoryService } from './service/ministry-history.service';
import { IDOMAIN_PERMISSION_SERVICE } from '../../permission/service/domain-permission.service.interface';
import { HistoryPermissionService } from '../guard/history-permission.service';
import { IMEMBER_FILTER_SERVICE } from '../../members/service/interface/member-filter.service.interface';
import { MemberFilterService } from '../../members/service/member-filter.service';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { GroupsDomainModule } from '../../management/groups/groups-domain/groups-domain.module';
import { RouterModule } from '@nestjs/core';
import { MinistryHistoryDomainModule } from './ministry-history-domain/ministry-history-domain.module';
import { MinistryGroupHistoryService } from './service/ministry-group-history.service';
import { MinistryGroupRoleHistoryController } from './controller/ministry-group-role-history.controller';
import { MinistryGroupRoleHistoryService } from './service/ministry-group-role-history.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId/histories/ministry-groups', // 공통 prefix
        module: MinistryHistoryModule,
      },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    MinistriesDomainModule,
    GroupsDomainModule,

    MinistryHistoryDomainModule,
  ],
  controllers: [
    MinistryGroupHistoryController,
    MinistryGroupRoleHistoryController,
    MinistryHistoryController,
  ],
  providers: [
    MinistryHistoryService,
    MinistryGroupRoleHistoryService,
    MinistryGroupHistoryService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: HistoryPermissionService,
    },
    {
      provide: IMEMBER_FILTER_SERVICE,
      useClass: MemberFilterService,
    },
  ],
})
export class MinistryHistoryModule {}
