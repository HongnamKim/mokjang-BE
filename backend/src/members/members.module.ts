import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModel } from './entity/member.entity';
import { MembersController } from './controller/members.controller';
import { MembersService } from './service/members.service';
import { RouterModule } from '@nestjs/core';
import { SearchMembersService } from './service/search-members.service';
import { ChurchModel } from '../churches/entity/church.entity';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from './member-domain/members-domain.module';
import { ISEARCH_MEMBERS_SERVICE } from './service/interface/search-members.service.interface';
import { FamilyRelationDomainModule } from '../family-relation/family-relation-domain/family-relation-domain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberModel, ChurchModel]),
    RouterModule.register([
      { path: 'churches/:churchId', module: MembersModule },
    ]),
    ChurchesDomainModule,
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
  ],
  exports: [],
})
export class MembersModule {}
