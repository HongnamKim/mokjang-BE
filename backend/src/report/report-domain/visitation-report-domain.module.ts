import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitationReportModel } from '../entity/visitation-report.entity';
import { IVISITATION_REPORT_DOMAIN_SERVICE } from './service/visitation-report-domain.service.interface';
import { VisitationReportDomainService } from './service/visitation-report-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([VisitationReportModel])],
  providers: [
    {
      provide: IVISITATION_REPORT_DOMAIN_SERVICE,
      useClass: VisitationReportDomainService,
    },
  ],
  exports: [IVISITATION_REPORT_DOMAIN_SERVICE],
})
export class VisitationReportDomainModule {}
