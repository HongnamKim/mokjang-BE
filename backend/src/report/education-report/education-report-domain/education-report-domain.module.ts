import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationSessionReportModel } from '../entity/education-session-report.entity';
import { IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE } from './interface/education-session-report-domain.service.interface';
import { EducationSessionReportDomainService } from './service/education-session-report-domain.service';
//import { EducationTermReportModel } from '../entity/education-term-report.entity';
import { IEDUCATION_TERM_REPORT_DOMAIN_SERVICE } from './interface/education-term-report-domain.service.interface';
import { EducationTermReportDomainService } from './service/education-term-report-domain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      //EducationTermReportModel,
      EducationSessionReportModel,
    ]),
  ],
  providers: [
    /*{
      provide: IEDUCATION_TERM_REPORT_DOMAIN_SERVICE,
      useClass: EducationTermReportDomainService,
    },*/
    {
      provide: IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE,
      useClass: EducationSessionReportDomainService,
    },
  ],
  exports: [
    //IEDUCATION_TERM_REPORT_DOMAIN_SERVICE,
    IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE,
  ],
})
export class EducationReportDomainModule {}
