import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModel } from './entity/member.entity';
import { MembersController } from './controller/members.controller';
import { MembersService } from './service/members.service';
import { ChurchesModule } from '../churches.module';
import { FamilyModel } from './entity/family.entity';
import { FamilyService } from './service/family.service';
import { RouterModule } from '@nestjs/core';
import { MembersFamilyController } from './controller/members-family.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberModel, FamilyModel]),
    RouterModule.register([
      { path: 'churches/:churchId/members', module: MembersModule },
    ]),
    ChurchesModule,
  ],
  exports: [MembersService],
  controllers: [MembersController, MembersFamilyController],
  providers: [MembersService, FamilyService],
})
export class MembersModule {}
