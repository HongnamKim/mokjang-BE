import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { VisitationController } from './controller/visitation.controller';
import { VisitationService } from './service/visitation.service';
import { VisitationDomainModule } from './visitation-domain/visitation-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { VisitationReportDomainModule } from '../report/report-domain/visitation-report-domain.module';
import { VisitationDetailController } from './controller/visitation-detail.controller';
import { VisitationDetailService } from './service/visitation-detail.service';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId', module: VisitationModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,

    VisitationDomainModule,
    VisitationReportDomainModule,
  ],
  controllers: [VisitationController, VisitationDetailController],
  providers: [VisitationService, VisitationDetailService],
})
export class VisitationModule {}
