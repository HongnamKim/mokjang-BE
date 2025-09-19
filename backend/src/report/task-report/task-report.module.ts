import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ChurchUserDomainModule } from '../../church-user/church-user-domain/church-user-domain.module';
import { TaskReportDomainModule } from './task-report-domain/task-report-domain.module';
import { TaskReportController } from './controller/task-report.controller';
import { TaskReportService } from './service/task-report.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'me/reports',
        module: TaskReportModule,
      },
    ]),
    ChurchUserDomainModule,
    TaskReportDomainModule,
  ],
  controllers: [TaskReportController],
  providers: [TaskReportService],
})
export class TaskReportModule {}
