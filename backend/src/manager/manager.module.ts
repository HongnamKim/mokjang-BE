import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ManagerDomainModule } from './manager-domain/manager-domain.module';
import { ManagerController } from './controller/manager.controller';
import { ManagerService } from './service/manager.service';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { PermissionDomainModule } from '../permission/permission-domain/permission-domain.module';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';
import { ManagerPermissionService } from './service/manager-permission.service';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId', module: ManagerModule },
    ]),
    UserDomainModule,
    ChurchesDomainModule,
    PermissionDomainModule,
    ManagerDomainModule,
    GroupsDomainModule,
  ],
  controllers: [ManagerController],
  providers: [
    ManagerService,
    { provide: IDOMAIN_PERMISSION_SERVICE, useClass: ManagerPermissionService },
  ],
})
export class ManagerModule {}
