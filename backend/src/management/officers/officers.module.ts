import { Module } from '@nestjs/common';
import { OfficersController } from './controller/officers.controller';
import { OfficersService } from './service/officers.service';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { OfficersDomainModule } from './officer-domain/officers-domain.module';
import { RouterModule } from '@nestjs/core';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../../permission/service/domain-permission.service.interface';
import { ManagementPermissionService } from '../management-permission.service';
import { OfficersMembersController } from './controller/officers-members.controller';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { OfficerMembersService } from './service/officer-members.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/management', // 공통 prefix
        module: OfficersModule,
      },
    ]),
    ChurchesDomainModule,
    OfficersDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
  ],
  controllers: [OfficersController, OfficersMembersController],
  providers: [
    OfficersService,
    OfficerMembersService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: ManagementPermissionService,
    },
  ],
  exports: [],
})
export class OfficersModule {}
