import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseModel, BaseModelColumns } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { TaskStatus } from '../const/task-status.enum';
import { MemberModel } from '../../members/entity/member.entity';
import { TaskType } from '../const/task-type.enum';
import { TaskReportModel } from '../../report/entity/task-report.entity';

@Entity()
export class TaskModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.tasks)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column({ enum: TaskType, default: TaskType.parent })
  taskType: TaskType;

  @Column({ length: 50, comment: '업무 제목' })
  title: string;

  @Column({
    enum: TaskStatus,
    default: TaskStatus.RESERVE,
  })
  status: TaskStatus;

  @Index()
  @Column({
    type: 'timestamptz',
    comment: '업무 시작 일자',
    default: new Date('2025-01-01'),
  })
  startDate: Date;

  @Column({
    type: 'timestamptz',
    comment: '업무 종료 일자',
    default: new Date('2025-01-01'),
  })
  endDate: Date;

  @OneToMany(() => TaskModel, (subTask) => subTask.parentTask)
  subTasks: TaskModel[];

  @Index()
  @Column({ comment: '상위 업무 ID', nullable: true })
  parentTaskId: number | null;

  @ManyToOne(() => TaskModel, (parentTask) => parentTask.subTasks)
  parentTask: TaskModel;

  @Column({ default: '' })
  content: string;

  @Index()
  @Column({ comment: '담당자 ID', nullable: true })
  inChargeId: number;

  @ManyToOne(() => MemberModel, (member) => member.assignedTask)
  @JoinColumn({ name: 'inChargeId' })
  inCharge: MemberModel;

  @Index()
  @Column({ comment: '업무 생성자 ID' })
  creatorId: number;

  @ManyToOne(() => MemberModel, (member) => member.createdTask)
  @JoinColumn({ name: 'creatorId' })
  creator: MemberModel;

  @OneToMany(() => TaskReportModel, (taskReport) => taskReport.task)
  reports: TaskReportModel[];
}

export const TaskModelColumns = {
  ...BaseModelColumns,
  title: 'title',
};
