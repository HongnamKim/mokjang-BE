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
import { ChurchModel } from '../entity/church.entity';
import { ChurchesDomainModule } from '../churches-domain/churches-domain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberModel, FamilyModel, ChurchModel]),
    RouterModule.register([
      { path: 'churches/:churchId/members', module: MembersModule },
    ]),
    ChurchesDomainModule,
  ],
  exports: [MembersService, FamilyService],
  controllers: [MembersController, MembersFamilyController],
  providers: [MembersService, FamilyService, SearchMembersService],
})
export class MembersModule {}
