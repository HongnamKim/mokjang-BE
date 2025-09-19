import { Module } from '@nestjs/common';
import { OfficersController } from './controller/officers.controller';
import { OfficersService } from './service/officers.service';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { OfficersDomainModule } from './officer-domain/officers-domain.module';
import { RouterModule } from '@nestjs/core';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { OfficersMembersController } from './controller/officers-members.controller';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { OfficerMembersService } from './service/officer-members.service';
import { OfficerHistoryDomainModule } from '../../member-history/officer-history/officer-history-domain/officer-history-domain.module';
import { IMEMBER_FILTER_SERVICE } from '../../members/service/interface/member-filter.service.interface';
import { MemberFilterService } from '../../members/service/member-filter.service';
import { GroupsDomainModule } from '../groups/groups-domain/groups-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: OfficersModule,
      },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    GroupsDomainModule,

    OfficersDomainModule,
    OfficerHistoryDomainModule,
  ],
  controllers: [OfficersController, OfficersMembersController],
  providers: [
    OfficersService,
    OfficerMembersService,
    { provide: IMEMBER_FILTER_SERVICE, useClass: MemberFilterService },
  ],
  exports: [],
})
export class OfficersModule {}
