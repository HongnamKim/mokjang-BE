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
import { IDOMAIN_PERMISSION_SERVICE } from '../../permission/service/domain-permission.service.interface';
import { ManagementPermissionService } from '../management-permission.service';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { MinistryMemberService } from './service/ministry-member.service';
import { MinistryGroupMemberService } from './service/ministry-group-member.service';
import { MinistriesMembersController } from './controller/ministries-members.controller';
import { MinistryGroupsMembersController } from './controller/ministry-groups-members.controller';

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
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: ManagementPermissionService,
    },
  ],
  exports: [],
})
export class MinistriesModule {}
