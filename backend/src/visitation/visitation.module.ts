import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { VisitationController } from './controller/visitation.controller';
import { VisitationService } from './visitation.service';
import { VisitationDomainModule } from './visitation-domain/visitation-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId', module: VisitationModule },
    ]),

    ChurchesDomainModule,
    UserDomainModule,
    MembersDomainModule,

    VisitationDomainModule,
  ],
  controllers: [VisitationController],
  providers: [VisitationService],
})
export class VisitationModule {}
