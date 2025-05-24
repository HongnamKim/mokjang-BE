import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationSessionReportModel } from '../entity/education-session-report.entity';
import { IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE } from './interface/education-session-report-domain.service.interface';
import { EducationSessionReportDomainService } from './service/education-session-report-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([EducationSessionReportModel])],
  providers: [
    {
      provide: IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE,
      useClass: EducationSessionReportDomainService,
    },
  ],
  exports: [IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE],
})
export class EducationSessionReportDomainModule {}
