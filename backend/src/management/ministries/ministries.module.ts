import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinistryModel } from './entity/ministry.entity';
import { MinistriesController } from './controller/ministries.controller';
import { MinistryGroupsController } from './controller/ministry-groups.controller';
import { MinistryService } from './service/ministry.service';
import { MinistryGroupService } from './service/ministry-group.service';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { RouterModule } from '@nestjs/core';
import { MinistriesDomainModule } from './ministries-domain/ministries-domain.module';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { MinistryMemberService } from './service/ministry-member.service';
import { MinistryGroupMemberService } from './service/ministry-group-member.service';
import { MinistriesMembersController } from './controller/ministries-members.controller';
import { MinistryGroupsMembersController } from './controller/ministry-groups-members.controller';
import { MinistryHistoryDomainModule } from '../../member-history/ministry-history/ministry-history-domain/ministry-history-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: MinistriesModule,
      },
    ]),
    TypeOrmModule.forFeature([MinistryModel]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MinistriesDomainModule,
    MembersDomainModule,

    MinistryHistoryDomainModule,
  ],
  controllers: [
    MinistryGroupsController,
    MinistryGroupsMembersController,
    MinistriesController,
    MinistriesMembersController,
  ],
  providers: [
    MinistryService,
    MinistryMemberService,
    MinistryGroupService,
    MinistryGroupMemberService,
  ],
  exports: [],
})
export class MinistriesModule {}
