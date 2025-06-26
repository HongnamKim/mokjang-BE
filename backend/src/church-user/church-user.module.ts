import { Module } from '@nestjs/common';
import { ChurchUserController } from './controller/church-user.controller';
import { ChurchUserService } from './service/church-user.service';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { ChurchUserDomainModule } from './church-user-domain/church-user-domain.module';
import { RouterModule } from '@nestjs/core';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';
import { ChurchUserPermissionService } from './service/church-user-permission.service';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';

/**
 * 교회에 가입된 계정을 관리하는 모듈
 */
@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId', module: ChurchUserModule },
    ]),
    ChurchesDomainModule,
    UserDomainModule,
    MembersDomainModule,
    ChurchUserDomainModule,
    ManagerDomainModule,
  ],
  controllers: [ChurchUserController],
  providers: [
    ChurchUserService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: ChurchUserPermissionService,
    },
  ],
})
export class ChurchUserModule {}
