import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { HomeController } from './controller/home.controller';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { IDOMAIN_PERMISSION_SERVICE } from '../permission/service/domain-permission.service.interface';
import { HomePermissionService } from './service/home-permission.service';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { HomeService } from './service/home.service';
import { TaskDomainModule } from '../task/task-domain/task-domain.module';
import { VisitationDomainModule } from '../visitation/visitation-domain/visitation-domain.module';
import { EducationDomainModule } from '../management/educations/service/education-domain/education-domain.module';
import { TaskReportDomainModule } from '../report/report-domain/task-report-domain.module';
import { VisitationReportDomainModule } from '../report/report-domain/visitation-report-domain.module';
import { EducationSessionReportDomainModule } from '../report/report-domain/education-session-report-domain.module';

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

    TaskReportDomainModule,
    VisitationReportDomainModule,
    EducationSessionReportDomainModule,
  ],
  controllers: [HomeController],
  providers: [
    HomeService,
    {
      provide: IDOMAIN_PERMISSION_SERVICE,
      useClass: HomePermissionService,
    },
  ],
})
export class HomeModule {}
