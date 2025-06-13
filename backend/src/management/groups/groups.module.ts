import { Module } from '@nestjs/common';
import { GroupsDomainModule } from './groups-domain/groups-domain.module';
import { GroupsService } from './service/groups.service';
import { GroupRolesService } from './service/group-roles.service';
import { GroupsController } from './controller/groups.controller';
import { GroupsRolesController } from './controller/groups-roles.controller';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { RouterModule } from '@nestjs/core';
import { IDOMAIN_PERMISSION_SERVICE } from '../../permission/service/domain-permission.service.interface';
import { ManagementPermissionService } from '../management-permission.service';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: GroupsModule,
      },
    ]),
    GroupsDomainModule,
    ChurchesDomainModule,
    ManagerDomainModule,
  ],
  controllers: [GroupsController, GroupsRolesController],
  providers: [
    GroupsService,
    GroupRolesService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: ManagementPermissionService,
    },
  ],
  exports: [],
})
export class GroupsModule {}
