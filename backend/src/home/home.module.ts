import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { HomeController } from './controller/home.controller';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { HomeService } from './service/home.service';
import { TaskDomainModule } from '../task/task-domain/task-domain.module';
import { VisitationDomainModule } from '../visitation/visitation-domain/visitation-domain.module';
import { TaskReportDomainModule } from '../report/task-report/task-report-domain/task-report-domain.module';
import { VisitationReportDomainModule } from '../report/visitation-report/visitation-report-domain/visitation-report-domain.module';
import { EducationReportDomainModule } from '../report/education-report/education-report-domain/education-report-domain.module';
import { WorshipDomainModule } from '../worship/worship-domain/worship-domain.module';
import { GroupsDomainModule } from '../management/groups/groups-domain/groups-domain.module';
import { EducationDomainModule } from '../educations/education-domain/education-domain.module';
import { ReportDomainModule } from '../report/report-domain/report-domain.module';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/home', module: HomeModule },
    ]),
    ChurchesDomainModule,
    ManagerDomainModule,

    MembersDomainModule,

    TaskDomainModule,
    VisitationDomainModule,
    EducationDomainModule,

    ReportDomainModule,
    TaskReportDomainModule,
    VisitationReportDomainModule,
    EducationReportDomainModule,

    WorshipDomainModule,
    GroupsDomainModule,
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
