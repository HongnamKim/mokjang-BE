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
  taskStatus: TaskStatus;

  @Index()
  @Column({ type: 'timestamptz', comment: '업무 시작 일자' })
  taskStartDate: Date;

  @Column({ type: 'timestamptz', comment: '업무 종료 일자' })
  taskEndDate: Date;

  @OneToMany(() => TaskModel, (subTask) => subTask.parentTask)
  subTasks: TaskModel[];

  @Index()
  @Column({ comment: '상위 업무 ID', nullable: true })
  parentTaskId: number | null;

  @ManyToOne(() => TaskModel, (parentTask) => parentTask.subTasks)
  parentTask: TaskModel;

  @Column({ default: '' })
  comment: string;

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

  /*
  추가할 컬럼
  == 1. 담당자 --> ManyToMany
  == 2. 생성자 --> ManyToOne
  3. 보고서 --> OneToMany
  == 4. 하위 업무 --> OneToMany
  == 5. 상위 업무 --> ManyToOne
   */
}

export const TaskModelColumns = {
  ...BaseModelColumns,
  title: 'title',
};
