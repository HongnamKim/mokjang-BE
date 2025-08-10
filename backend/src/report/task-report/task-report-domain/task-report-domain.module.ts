import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskReportModel } from '../entity/task-report.entity';
import { TaskReportDomainService } from './service/task-report-domain.service';
import { ITASK_REPORT_DOMAIN_SERVICE } from './interface/task-report-domain.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([TaskReportModel])],
  providers: [
    {
      provide: ITASK_REPORT_DOMAIN_SERVICE,
      useClass: TaskReportDomainService,
    },
  ],
  exports: [ITASK_REPORT_DOMAIN_SERVICE],
})
export class TaskReportDomainModule {}
