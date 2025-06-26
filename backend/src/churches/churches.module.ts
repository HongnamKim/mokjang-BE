import { Module } from '@nestjs/common';
import { ChurchesService } from './service/churches.service';
import { ChurchesController } from './controller/churches.controller';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { ChurchesDomainModule } from './churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ChurchUserDomainModule } from '../church-user/church-user-domain/church-user-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';
import { ChurchPermissionService } from './service/church-permission.service';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';

@Module({
  imports: [
    UserDomainModule,
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    ChurchUserDomainModule,
  ],
  controllers: [ChurchesController],
  providers: [
    ChurchesService,
    { provide: IDOMAIN_PERMISSION_SERVICE, useClass: ChurchPermissionService },
  ],
})
export class ChurchesModule {}
