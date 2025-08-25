import { ChurchModel } from '../../../churches/entity/church.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { TaskModel } from '../../entity/task.entity';
import { CreateTaskDto } from '../../dto/request/create-task.dto';
import { GetTasksDto } from '../../dto/request/get-tasks.dto';
import { TaskDomainPaginationResultDto } from '../../dto/task-domain-pagination-result.dto';
import { UpdateTaskDto } from '../../dto/request/update-task.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { MyScheduleStatusCountDto } from '../../dto/my-schedule-status-count.dto';

export const ITASK_DOMAIN_SERVICE = Symbol('ITASK_DOMAIN_SERVICE');

export interface ITaskDomainService {
  findTasks(
    church: ChurchModel,
    dto: GetTasksDto,
    qr?: QueryRunner,
  ): Promise<TaskDomainPaginationResultDto>;

  findSubTasks(
    church: ChurchModel,
    parentTask: TaskModel,
    qr?: QueryRunner,
  ): Promise<TaskModel[]>;

  findTaskById(
    church: ChurchModel,
    taskId: number,
    qr?: QueryRunner,
  ): Promise<TaskModel>;

  findTaskModelById(
    church: ChurchModel,
    taskId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<TaskModel>,
  ): Promise<TaskModel>;

  findParentTaskModelById(
    church: ChurchModel,
    taskId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<TaskModel>,
  ): Promise<TaskModel>;

  createTask(
    church: ChurchModel,
    creatorManager: ChurchUserModel,
    parentTask: TaskModel | null,
    inChargeMember: ChurchUserModel | null,
    dto: CreateTaskDto,
    qr: QueryRunner,
  ): Promise<TaskModel>;

  updateTask(
    targetTask: TaskModel,
    newInChargeMember: ChurchUserModel | null,
    newParentTask: TaskModel | null,
    dto: UpdateTaskDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteTask(targetTask: TaskModel, qr: QueryRunner): Promise<void>;

  countAllTasks(church: ChurchModel, qr: QueryRunner): Promise<number>;

  findMyTasks(
    inCharge: MemberModel,
    from: Date,
    to: Date,
  ): Promise<TaskModel[]>;

  countMyTaskStatus(
    me: MemberModel,
    from: Date,
    to: Date,
  ): Promise<MyScheduleStatusCountDto>;
}
