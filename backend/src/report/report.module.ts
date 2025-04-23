import { Module } from '@nestjs/common';
import { VisitationReportDomainModule } from './report-domain/visitation-report-domain.module';
import { RouterModule } from '@nestjs/core';
import { ReportController } from './controller/report.controller';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ReportService } from './service/report.service';

@Module({
  imports: [
    RouterModule.register([
      { path: 'churches/:churchId/members/:memberId', module: ReportModule },
    ]),
    ChurchesDomainModule,
    MembersDomainModule,
    VisitationReportDomainModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [],
})
export class ReportModule {}
