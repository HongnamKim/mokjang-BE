import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { GroupsDomainModule } from '../../management/groups/groups-domain/groups-domain.module';
import { OfficerHistoryService } from './service/officer-history.service';
import { IDOMAIN_PERMISSION_SERVICE } from '../../permission/service/domain-permission.service.interface';
import { HistoryPermissionService } from '../guard/history-permission.service';
import { IMEMBER_FILTER_SERVICE } from '../../members/service/interface/member-filter.service.interface';
import { MemberFilterService } from '../../members/service/member-filter.service';
import { OfficerHistoryController } from './controller/officer-history.controller';
import { OfficerHistoryDomainModule } from './officer-history-domain/officer-history-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId/histories', // 공통 prefix
        module: OfficerHistoryModule,
      },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    GroupsDomainModule,

    OfficerHistoryDomainModule,
  ],
  controllers: [OfficerHistoryController],
  providers: [
    OfficerHistoryService,
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
export class OfficerHistoryModule {}
