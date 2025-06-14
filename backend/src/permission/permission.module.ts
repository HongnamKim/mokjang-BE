import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { PermissionController } from './controller/permission.controller';
import { PermissionService } from './service/permission.service';
import { PermissionDomainModule } from './permission-domain/permission-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from './service/domain-permission.service.interface';
import { PermissionPermissionService } from './service/permission-permission.service';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId', module: PermissionModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    PermissionDomainModule,
  ],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: PermissionPermissionService,
    },
  ],
  exports: [],
})
export class PermissionModule {}
