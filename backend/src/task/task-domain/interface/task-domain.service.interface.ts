import { ChurchModel } from '../../../churches/entity/church.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { TaskModel } from '../../entity/task.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { CreateTaskDto } from '../../dto/request/create-task.dto';
import { GetTasksDto } from '../../dto/request/get-tasks.dto';
import { TaskDomainPaginationResultDto } from '../../dto/task-domain-pagination-result.dto';
import { UpdateTaskDto } from '../../dto/request/update-task.dto';

export const ITASK_DOMAIN_SERVICE = Symbol('ITASK_DOMAIN_SERVICE');

export interface ITaskDomainService {
  findTasks(
    church: ChurchModel,
    dto: GetTasksDto,
    qr?: QueryRunner,
  ): Promise<TaskDomainPaginationResultDto>;

  findTaskById(
    church: ChurchModel,
    taskId: number,
    qr?: QueryRunner,
  ): Promise<TaskModel>;

  findTaskModelById(
    church: ChurchModel,
    taskId: number,
    purpose?: string,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<TaskModel>,
  ): Promise<TaskModel>;

  assertValidInChargeMember(inChargeMember: MemberModel): void;

  createTask(
    church: ChurchModel,
    creatorMember: MemberModel,
    parentTask: TaskModel | null,
    inChargeMember: MemberModel | null,
    dto: CreateTaskDto,
    qr: QueryRunner,
  ): Promise<TaskModel>;

  updateTask(
    targetTask: TaskModel,
    newInChargeMember: MemberModel | null,
    newParentTask: TaskModel | null,
    dto: UpdateTaskDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteTask(targetTask: TaskModel, qr: QueryRunner): Promise<void>;
}
