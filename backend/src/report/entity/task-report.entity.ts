import { ChildEntity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ReportModel } from './report.entity';
import { TaskModel } from '../../task/entity/task.entity';
import { ReportType } from '../const/report-type.enum';

@ChildEntity(ReportType.TASK)
export class TaskReportModel extends ReportModel {
  @Index()
  @Column()
  taskId: number;

  @ManyToOne(() => TaskModel)
  @JoinColumn({ name: 'taskId' })
  task: TaskModel;
}
