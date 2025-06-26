import { Module } from '@nestjs/common';
import { FamilyRelationDomainModule } from './family-relation-domain/family-relation-domain.module';
import { FamilyRelationService } from './service/family-relation.service';
import { FamilyRelationController } from './controller/family-relation.controller';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { RouterModule } from '@nestjs/core';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';
import { FamilyPermissionService } from './service/family-permission.service';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/members', module: FamilyRelationModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    FamilyRelationDomainModule,
  ],
  controllers: [FamilyRelationController],
  providers: [
    FamilyRelationService,
    { provide: IDOMAIN_PERMISSION_SERVICE, useClass: FamilyPermissionService },
  ],
  exports: [],
})
export class FamilyRelationModule {}
