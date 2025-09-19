import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ManagerDomainModule } from './manager-domain/manager-domain.module';
import { ManagerController } from './controller/manager.controller';
import { ManagerService } from './service/manager.service';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { PermissionDomainModule } from '../permission/permission-domain/permission-domain.module';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';
import { ManagerNotificationService } from './service/manager-notification.service';

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
  providers: [ManagerService, ManagerNotificationService],
})
export class ManagerModule {}
