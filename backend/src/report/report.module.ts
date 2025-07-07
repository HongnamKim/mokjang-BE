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
import { EducationSessionReportDomainModule } from './report-domain/education-session-report-domain.module';
import { UserDomainModule } from '../user/user-domain/user-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'me/reports',
        module: ReportModule,
      },
    ]),
    UserDomainModule,
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
