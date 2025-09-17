import { Module } from '@nestjs/common';
import { MembersController } from './controller/members.controller';
import { MembersService } from './service/members.service';
import { RouterModule } from '@nestjs/core';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from './member-domain/members-domain.module';
import { FamilyRelationDomainModule } from '../family-relation/family-relation-domain/family-relation-domain.module';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';
import { IMEMBER_FILTER_SERVICE } from './service/interface/member-filter.service.interface';
import { MemberFilterService } from './service/member-filter.service';
import { WorshipDomainModule } from '../worship/worship-domain/worship-domain.module';
import { MinistryHistoryDomainModule } from '../member-history/ministry-history/ministry-history-domain/ministry-history-domain.module';
import { ChurchUserDomainModule } from '../church-user/church-user-domain/church-user-domain.module';
import { ISEARCH_MEMBERS_SERVICE } from './service/interface/search-members.service.interface';
import { SearchMembersService } from './service/search-members.service';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId', module: MembersModule },
    ]),
    ChurchesDomainModule,
    ChurchUserDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    FamilyRelationDomainModule,
    GroupsDomainModule,
    WorshipDomainModule,
    MinistryHistoryDomainModule,
  ],
  controllers: [MembersController],
  providers: [
    MembersService,
    {
      provide: ISEARCH_MEMBERS_SERVICE,
      useClass: SearchMembersService,
    },
    {
      provide: IMEMBER_FILTER_SERVICE,
      useClass: MemberFilterService,
    },
  ],
  exports: [],
})
export class MembersModule {}
