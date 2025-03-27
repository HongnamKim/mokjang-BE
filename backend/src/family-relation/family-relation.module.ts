import { Module } from '@nestjs/common';
import { FamilyRelationDomainModule } from './family-relation-domain/family-relation-domain.module';
import { FamilyRelationService } from './service/family-relation.service';
import { FamilyRelationController } from './controller/family-relation.controller';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/members', module: FamilyRelationModule },
    ]),
    ChurchesDomainModule,
    MembersDomainModule,
    FamilyRelationDomainModule,
  ],
  controllers: [FamilyRelationController],
  providers: [FamilyRelationService],
  exports: [],
})
export class FamilyRelationModule {}
