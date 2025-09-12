import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { VisitationController } from './controller/visitation.controller';
import { VisitationService } from './service/visitation.service';
import { VisitationDomainModule } from './visitation-domain/visitation-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { VisitationReportDomainModule } from '../report/visitation-report/visitation-report-domain/visitation-report-domain.module';
import { VisitationDetailController } from './controller/visitation-detail.controller';
import { VisitationDetailService } from './service/visitation-detail.service';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { VisitationNotificationService } from './service/visitation-notification.service';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';
import { MemberFilterService } from '../members/service/member-filter.service';
import { IMEMBER_FILTER_SERVICE } from '../members/service/interface/member-filter.service.interface';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId', module: VisitationModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,
    GroupsDomainModule,
    MembersDomainModule,

    VisitationDomainModule,
    VisitationReportDomainModule,
  ],
  controllers: [VisitationController, VisitationDetailController],
  providers: [
    VisitationService,
    VisitationDetailService,
    VisitationNotificationService,
    {
      provide: IMEMBER_FILTER_SERVICE,
      useClass: MemberFilterService,
    },
  ],
})
export class VisitationModule {}
