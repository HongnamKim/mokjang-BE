import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ChurchUserDomainModule } from '../../church-user/church-user-domain/church-user-domain.module';
import { VisitationReportDomainModule } from './visitation-report-domain/visitation-report-domain.module';
import { VisitationReportController } from './controller/visitation-report.controller';
import { VisitationReportService } from './service/visitation-report.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'me/reports',
        module: VisitationReportModule,
      },
    ]),
    ChurchUserDomainModule,
    VisitationReportDomainModule,
  ],
  controllers: [VisitationReportController],
  providers: [VisitationReportService],
})
export class VisitationReportModule {}
