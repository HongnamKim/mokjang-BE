import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ChurchUserDomainModule } from '../../church-user/church-user-domain/church-user-domain.module';
import { EducationReportDomainModule } from './education-report-domain/education-report-domain.module';
import { EducationTermReportController } from './controller/education-term-report.controller';
import { EducationSessionReportController } from './controller/education-session-report.controller';
import { EducationSessionReportService } from './service/education-session-report.service';
import { EducationTermReportService } from './service/education-term-report.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'me/reports',
        module: EducationReportModule,
      },
    ]),
    ChurchUserDomainModule,
    EducationReportDomainModule,
  ],
  controllers: [
    EducationTermReportController,
    EducationSessionReportController,
  ],
  providers: [EducationSessionReportService, EducationTermReportService],
})
export class EducationReportModule {}
