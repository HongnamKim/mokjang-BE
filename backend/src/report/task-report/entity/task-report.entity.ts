import { ChildEntity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ReportModel } from '../../base-report/entity/report.entity';
import { TaskModel } from '../../../task/entity/task.entity';
import { ReportType } from '../../base-report/const/report-type.enum';

@ChildEntity(ReportType.TASK)
export class TaskReportModel extends ReportModel {
  @Index()
  @Column()
  taskId: number;

  @ManyToOne(() => TaskModel, (task) => task.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: TaskModel;
}
