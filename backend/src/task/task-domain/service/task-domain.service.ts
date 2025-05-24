import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskModel } from '../../entity/task.entity';
import {
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { TaskDomainPaginationResultDto } from '../../dto/task-domain-pagination-result.dto';
import { TaskException } from '../../const/exception-message/task.exception';
import { CreateTaskDto } from '../../dto/request/create-task.dto';
import { ITaskDomainService } from '../interface/task-domain.service.interface';
import { MemberModel } from '../../../members/entity/member.entity';
import {
  TaskFindOptionsRelation,
  TaskFindOptionsSelect,
  TasksFindOptionsRelation,
  TasksFindOptionsSelect,
} from '../../const/task-find-options.const';
import { TaskType } from '../../const/task-type.enum';
import { UserRole } from '../../../user/const/user-role.enum';
import { MemberException } from '../../../members/const/exception/member.exception';
import { GetTasksDto } from '../../dto/request/get-tasks.dto';
import { TaskOrder } from '../../const/task-order.enum';
import { MAX_SUB_TASK_COUNT } from '../../const/task.constraints';
import { UpdateTaskDto } from '../../dto/request/update-task.dto';

@Injectable()
export class TaskDomainService implements ITaskDomainService {
  constructor(
    @InjectRepository(TaskModel)
    private readonly taskRepository: Repository<TaskModel>,
  ) {}

  private getTaskRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(TaskModel) : this.taskRepository;
  }

  private parseTaskDate(dto: GetTasksDto) {
    if (dto.fromTaskStartDate && !dto.toTaskStartDate) {
      return MoreThanOrEqual(dto.fromTaskStartDate);
    } else if (!dto.fromTaskStartDate && dto.toTaskStartDate) {
      return LessThanOrEqual(dto.toTaskStartDate);
    } else if (dto.fromTaskStartDate && dto.toTaskStartDate) {
      return Between(dto.fromTaskStartDate, dto.toTaskStartDate);
    } else {
      return undefined;
    }
  }

  async findTasks(church: ChurchModel, dto: GetTasksDto, qr?: QueryRunner) {
    const taskRepository = this.getTaskRepository(qr);

    const order: FindOptionsOrder<TaskModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== TaskOrder.createdAt) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      taskRepository.find({
        where: {
          churchId: church.id,
          taskType: TaskType.parent,
          title: dto.title && Like(`%${dto.title}%`),
          startDate: this.parseTaskDate(dto),
          status: dto.status,
          inChargeId: dto.inChargeId,
        },
        relations: TasksFindOptionsRelation,
        select: TasksFindOptionsSelect,
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      taskRepository.count({
        where: {
          churchId: church.id,
          taskType: TaskType.parent,
          title: dto.title && Like(`%${dto.title}%`),
          startDate: this.parseTaskDate(dto),
          status: dto.status,
          inChargeId: dto.inChargeId,
        },
      }),
    ]);

    return new TaskDomainPaginationResultDto(data, totalCount);
  }

  async findTaskById(church: ChurchModel, taskId: number, qr?: QueryRunner) {
    const taskRepository = this.getTaskRepository(qr);

    const task = await taskRepository.findOne({
      where: {
        churchId: church.id,
        id: taskId,
      },
      relations: TaskFindOptionsRelation,
      select: TaskFindOptionsSelect,
    });

    if (!task) {
      throw new NotFoundException(TaskException.NOT_FOUND());
    }

    return task;
  }

  async findTaskModelById(
    church: ChurchModel,
    taskId: number,
    purpose?: string,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<TaskModel>,
  ): Promise<TaskModel> {
    const taskRepository = this.getTaskRepository(qr);

    const task = await taskRepository.findOne({
      where: {
        churchId: church.id,
        id: taskId,
      },
      relations: relationOptions,
    });

    if (!task) {
      throw new NotFoundException(TaskException.NOT_FOUND(purpose));
    }

    return task;
  }

  assertValidInChargeMember(inChargeMember: MemberModel) {
    if (!inChargeMember.user) {
      throw new ConflictException(MemberException.NOT_LINKED_MEMBER);
    }

    if (
      inChargeMember.user.role !== UserRole.mainAdmin &&
      inChargeMember.user.role !== UserRole.manager
    ) {
      throw new ConflictException(TaskException.INVALID_IN_CHARGE_MEMBER);
    }
  }

  private async assertSubTaskLimitNotExceeded(
    parentTask: TaskModel,
    qr: QueryRunner,
  ) {
    const taskRepository = this.getTaskRepository(qr);

    const subTaskCount = await taskRepository.count({
      where: {
        parentTaskId: parentTask.id,
        taskType: TaskType.subTask,
      },
    });

    if (subTaskCount >= MAX_SUB_TASK_COUNT) {
      throw new ConflictException(TaskException.EXCEED_MAX_SUB_TASK);
    }
  }

  async createTask(
    church: ChurchModel,
    creatorMember: MemberModel,
    parentTask: TaskModel | null,
    inChargeMember: MemberModel | null,
    dto: CreateTaskDto,
    qr: QueryRunner,
  ) {
    const taskRepository = this.getTaskRepository(qr);

    if (parentTask && parentTask.taskType === TaskType.subTask) {
      throw new BadRequestException(TaskException.INVALID_PARENT_TASK);
    }

    if (parentTask) {
      await this.assertSubTaskLimitNotExceeded(parentTask, qr);
    }

    return taskRepository.save({
      churchId: church.id,
      creatorId: creatorMember.id,
      inChargeId: inChargeMember ? inChargeMember.id : undefined,
      parentTaskId: parentTask ? parentTask.id : undefined,
      taskType: parentTask ? TaskType.subTask : TaskType.parent,
      name: dto.title,
      status: dto.status,
      startDate: dto.startDate,
      endDate: dto.endDate,
      content: dto.content,
    });
  }

  private assertValidTaskDate(targetTask: TaskModel, dto: UpdateTaskDto) {
    // 시작 날짜 변경 시
    if (dto.startDate && !dto.endDate) {
      if (dto.startDate > targetTask.endDate) {
        throw new ConflictException(TaskException.INVALID_START_DATE);
      }
    }
    // 종료 날짜 변경 시
    else if (!dto.startDate && dto.endDate) {
      if (targetTask.startDate > dto.endDate) {
        throw new ConflictException(TaskException.INVALID_END_DATE);
      }
    } else {
      return;
    }
  }

  async updateTask(
    targetTask: TaskModel,
    newInChargeMember: MemberModel | null,
    newParentTask: TaskModel | null,
    dto: UpdateTaskDto,
    qr: QueryRunner,
  ) {
    if (newParentTask) {
      if (newParentTask.taskType === TaskType.subTask) {
        throw new BadRequestException(TaskException.INVALID_PARENT_TASK);
      }

      // 하위 업무가 존재할 경우(자신이 상위업무) 새로운 상위 업무를 지정할 수 없음.
      if (targetTask.subTasks.length !== 0) {
        throw new ConflictException(TaskException.INVALID_CHANGE_PARENT_TASK);
      }

      await this.assertSubTaskLimitNotExceeded(newParentTask, qr);

      if (newParentTask.id === targetTask.id) {
        throw new ConflictException(TaskException.INVALID_PARENT_TASK);
      }
    }

    const taskRepository = this.getTaskRepository(qr);

    this.assertValidTaskDate(targetTask, dto);

    const result = await taskRepository.update(
      {
        id: targetTask.id,
      },
      {
        inChargeId: newInChargeMember ? newInChargeMember.id : undefined,
        parentTaskId: newParentTask ? newParentTask.id : undefined,
        title: dto.title,
        status: dto.status,
        startDate: dto.startDate,
        endDate: dto.endDate,
        content: dto.content,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(TaskException.UPDATE_ERROR);
    }

    return result;
  }

  async deleteTask(targetTask: TaskModel, qr: QueryRunner): Promise<void> {
    const taskRepository = this.getTaskRepository(qr);

    if (targetTask.taskType === TaskType.parent) {
      const subTaskCount = await taskRepository.count({
        where: {
          parentTaskId: targetTask.id,
          taskType: TaskType.subTask,
        },
      });

      if (subTaskCount > 0) {
        throw new ConflictException(TaskException.TASK_HAS_DEPENDENCIES);
      }
    }

    const result = await taskRepository.softDelete({
      id: targetTask.id,
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(TaskException.DELETE_ERROR);
    }

    return;
  }
}
