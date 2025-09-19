import { Module } from '@nestjs/common';
import { FamilyRelationDomainModule } from './family-relation-domain/family-relation-domain.module';
import { FamilyRelationService } from './service/family-relation.service';
import { FamilyRelationController } from './controller/family-relation.controller';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { RouterModule } from '@nestjs/core';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { IMEMBER_FILTER_SERVICE } from '../members/service/interface/member-filter.service.interface';
import { MemberFilterService } from '../members/service/member-filter.service';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/members', module: FamilyRelationModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    FamilyRelationDomainModule,
    GroupsDomainModule,
  ],
  controllers: [FamilyRelationController],
  providers: [
    FamilyRelationService,
    {
      provide: IMEMBER_FILTER_SERVICE,
      useClass: MemberFilterService,
    },
  ],
  exports: [],
})
export class FamilyRelationModule {}
