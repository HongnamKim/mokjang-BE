import { Module } from '@nestjs/common';
import { VisitationReportDomainModule } from './report-domain/visitation-report-domain.module';
import { RouterModule } from '@nestjs/core';
import { VisitationReportController } from './controller/visitation-report.controller';
import { VisitationReportService } from './service/visitation-report.service';
import { TaskReportController } from './controller/task-report.controller';
import { TaskReportService } from './service/task-report.service';
import { TaskReportDomainModule } from './report-domain/task-report-domain.module';
import { EducationSessionReportController } from './controller/education-session-report.controller';
import { EducationSessionReportService } from './service/education-session-report.service';
import { EducationReportDomainModule } from './report-domain/education-report-domain.module';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { EducationTermReportController } from './controller/education-term-report.controller';
import { EducationTermReportService } from './service/education-term-report.service';
import { ChurchUserDomainModule } from '../church-user/church-user-domain/church-user-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'me/reports',
        module: ReportModule,
      },
    ]),
    UserDomainModule,
    ChurchUserDomainModule,
    VisitationReportDomainModule,
    TaskReportDomainModule,
    EducationReportDomainModule,
  ],
  controllers: [
    VisitationReportController,
    TaskReportController,
    EducationTermReportController,
    EducationSessionReportController,
  ],
  providers: [
    VisitationReportService,
    TaskReportService,
    EducationSessionReportService,
    EducationTermReportService,
  ],
  exports: [],
})
export class ReportModule {}
