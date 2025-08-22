import { Module } from '@nestjs/common';
import { EducationReportModule } from './education-report/education-report.module';
import { TaskReportModule } from './task-report/task-report.module';
import { VisitationReportModule } from './visitation-report/visitation-report.module';

@Module({
  imports: [VisitationReportModule, TaskReportModule, EducationReportModule],
})
export class ReportModule {}
