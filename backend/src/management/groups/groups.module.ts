import { Module } from '@nestjs/common';
import { GroupsDomainModule } from './groups-domain/groups-domain.module';
import { GroupsService } from './service/groups.service';
import { GroupsController } from './controller/groups.controller';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { RouterModule } from '@nestjs/core';
import { IDOMAIN_PERMISSION_SERVICE } from '../../permission/service/domain-permission.service.interface';
import { ManagementPermissionService } from '../management-permission.service';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { MemberHistoryDomainModule } from '../../member-history/member-history-domain/member-history-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: GroupsModule,
      },
    ]),
    GroupsDomainModule,
    MemberHistoryDomainModule,
    MembersDomainModule,
    ChurchesDomainModule,
    ManagerDomainModule,
  ],
  controllers: [GroupsController],
  providers: [
    GroupsService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: ManagementPermissionService,
    },
  ],
  exports: [],
})
export class GroupsModule {}
