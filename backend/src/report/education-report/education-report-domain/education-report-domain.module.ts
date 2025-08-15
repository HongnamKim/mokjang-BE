import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationReportModel } from '../entity/education-report.entity';
import { IEDUCATION_REPORT_DOMAIN_SERVICE } from './interface/education-report-domain.service.interface';
import { EducationReportDomainService } from './service/education-report-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([EducationReportModel])],
  providers: [
    {
      provide: IEDUCATION_REPORT_DOMAIN_SERVICE,
      useClass: EducationReportDomainService,
    },
  ],
  exports: [IEDUCATION_REPORT_DOMAIN_SERVICE],
})
export class EducationReportDomainModule {}
