import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModel } from './entity/member.entity';
import { MembersController } from './controller/members.controller';
import { MembersService } from './service/members.service';
import { FamilyModel } from './entity/family.entity';
import { FamilyService } from './service/family.service';
import { RouterModule } from '@nestjs/core';
import { MembersFamilyController } from './controller/members-family.controller';
import { SearchMembersService } from './service/search-members.service';
import { ChurchModel } from '../churches/entity/church.entity';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { EducationDomainModule } from '../management/educations/service/education-domain/education-domain.module';
import { MembersDomainModule } from './member-domain/members-domain.module';
import { ISEARCH_MEMBERS_SERVICE } from './service/interface/search-members.service.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberModel, FamilyModel, ChurchModel]),
    RouterModule.register([
      { path: 'churches/:churchId/members', module: MembersModule },
    ]),
    ChurchesDomainModule,
    MembersDomainModule,
    EducationDomainModule,
  ],
  controllers: [MembersController, MembersFamilyController],
  providers: [
    MembersService,
    FamilyService,
    {
      provide: ISEARCH_MEMBERS_SERVICE,
      useClass: SearchMembersService,
    },
  ],
  exports: [MembersService, FamilyService],
})
export class MembersModule {}
