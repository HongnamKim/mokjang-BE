import { Module } from '@nestjs/common';
import { VisitationReportDomainModule } from './report-domain/visitation-report-domain.module';
import { RouterModule } from '@nestjs/core';
import { VisitationReportController } from './controller/visitation-report.controller';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { VisitationReportService } from './service/visitation-report.service';
import { TaskReportController } from './controller/task-report.controller';
import { TaskReportService } from './service/task-report.service';
import { TaskReportDomainModule } from './report-domain/task-report-domain.module';
import { EducationSessionReportController } from './controller/education-session-report.controller';
import { EducationSessionReportService } from './service/education-session-report.service';
import { EducationSessionReportDomainModule } from './report-domain/education-session-report-domain.module';
import { ChurchUserDomainModule } from '../church-user/church-user-domain/church-user-domain.module';
import { UserDomainModule } from '../user/user-domain/user-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        //path: 'churches/:churchId/members/:memberId/reports',
        path: 'me/reports',
        module: ReportModule,
      },
    ]),
    UserDomainModule,
    ChurchesDomainModule,
    ChurchUserDomainModule,
    MembersDomainModule,
    VisitationReportDomainModule,
    TaskReportDomainModule,
    EducationSessionReportDomainModule,
  ],
  controllers: [
    VisitationReportController,
    TaskReportController,
    EducationSessionReportController,
  ],
  providers: [
    VisitationReportService,
    TaskReportService,
    EducationSessionReportService,
  ],
  exports: [],
})
export class ReportModule {}
