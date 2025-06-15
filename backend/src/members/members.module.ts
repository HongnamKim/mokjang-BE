import { Module } from '@nestjs/common';
import { MembersController } from './controller/members.controller';
import { MembersService } from './service/members.service';
import { RouterModule } from '@nestjs/core';
import { SearchMembersService } from './service/search-members.service';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from './member-domain/members-domain.module';
import { ISEARCH_MEMBERS_SERVICE } from './service/interface/search-members.service.interface';
import { FamilyRelationDomainModule } from '../family-relation/family-relation-domain/family-relation-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';
import { MemberPermissionService } from './service/member-permission.service';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';

@Module({
  imports: [
    //TypeOrmModule.forFeature([MemberModel, ChurchModel]),
    RouterModule.register([
      { path: 'churches/:churchId', module: MembersModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    FamilyRelationDomainModule,
  ],
  controllers: [MembersController],
  providers: [
    MembersService,
    {
      provide: ISEARCH_MEMBERS_SERVICE,
      useClass: SearchMembersService,
    },
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: MemberPermissionService,
    },
  ],
  exports: [],
})
export class MembersModule {}
