import { Module } from '@nestjs/common';
import { GroupsDomainModule } from './groups-domain/groups-domain.module';
import { GroupsService } from './service/groups.service';
import { GroupsController } from './controller/groups.controller';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { RouterModule } from '@nestjs/core';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { GroupHistoryDomainModule } from '../../member-history/group-history/group-history-domain/group-history-domain.module';
import { GroupMembersController } from './controller/group-members.controller';
import { GroupMembersService } from './service/group-members.service';
import { IMEMBER_FILTER_SERVICE } from '../../members/service/interface/member-filter.service.interface';
import { MemberFilterService } from '../../members/service/member-filter.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: GroupsModule,
      },
    ]),
    GroupsDomainModule,
    GroupHistoryDomainModule,
    MembersDomainModule,
    ChurchesDomainModule,
    ManagerDomainModule,
  ],
  controllers: [GroupsController, GroupMembersController],
  providers: [
    GroupsService,
    GroupMembersService,
    { provide: IMEMBER_FILTER_SERVICE, useClass: MemberFilterService },
  ],
  exports: [],
})
export class GroupsModule {}
