import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { PermissionController } from './controller/permission.controller';
import { PermissionService } from './service/permission.service';
import { PermissionDomainModule } from './permission-domain/permission-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId', module: PermissionModule },
    ]),
    ChurchesDomainModule,

    PermissionDomainModule,
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [],
})
export class PermissionModule {}
