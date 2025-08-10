import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportModel } from '../base-report/entity/report.entity';
import { IREPORT_DOMAIN_SERVICE } from './interface/report-domain.service.interface';
import { ReportDomainService } from './service/report-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportModel])],
  providers: [
    { provide: IREPORT_DOMAIN_SERVICE, useClass: ReportDomainService },
  ],
  exports: [IREPORT_DOMAIN_SERVICE],
})
export class ReportDomainModule {}
