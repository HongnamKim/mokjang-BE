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

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId/reports',
        module: ReportModule,
      },
    ]),
    ChurchesDomainModule,
    MembersDomainModule,
    VisitationReportDomainModule,
    TaskReportDomainModule,
  ],
  controllers: [VisitationReportController, TaskReportController],
  providers: [VisitationReportService, TaskReportService],
  exports: [],
})
export class ReportModule {}
