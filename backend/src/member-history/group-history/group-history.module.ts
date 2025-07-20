import { Module } from '@nestjs/common';
import { GroupHistoryController } from './controller/group-history.controller';
import { GroupHistoryService } from './service/group-history.service';
import { IDOMAIN_PERMISSION_SERVICE } from '../../permission/service/domain-permission.service.interface';
import { HistoryPermissionService } from '../guard/history-permission.service';
import { IMEMBER_FILTER_SERVICE } from '../../members/service/interface/member-filter.service.interface';
import { MemberFilterService } from '../../members/service/member-filter.service';
import { RouterModule } from '@nestjs/core';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { GroupsDomainModule } from '../../management/groups/groups-domain/groups-domain.module';
import { GroupHistoryDomainModule } from './group-history-domain/group-history-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId/histories', // 공통 prefix
        module: GroupHistoryModule,
      },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    GroupsDomainModule,

    GroupHistoryDomainModule,
  ],
  controllers: [GroupHistoryController],
  providers: [
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
})
export class GroupHistoryModule {}
