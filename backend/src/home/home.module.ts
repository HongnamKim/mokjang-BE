import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { HomeController } from './controller/home.controller';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';
import { HomePermissionService } from './service/home-permission.service';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { HomeService } from './service/home.service';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/home', module: HomeModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,

    MembersDomainModule,
  ],
  controllers: [HomeController],
  providers: [
    HomeService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: HomePermissionService,
    },
  ],
})
export class HomeModule {}
