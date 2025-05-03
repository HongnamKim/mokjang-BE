import {
  BadRequestException,
  ConflictException,
  Injectable,
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
} from '../../const/task-find-options.const';
import { TaskType } from '../../const/task-type.enum';
import { UserRole } from '../../../user/const/user-role.enum';
import { MemberException } from '../../../members/const/exception/member.exception';
import { GetTasksDto } from '../../dto/request/get-tasks.dto';
import { TaskOrder } from '../../const/task-order.enum';

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
          taskStartDate: this.parseTaskDate(dto),
          taskStatus: dto.taskStatus,
          inChargeId: dto.inChargeId,
        },
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      taskRepository.count({
        where: {
          churchId: church.id,
          taskType: TaskType.parent,
          title: dto.title && Like(`%${dto.title}%`),
          taskStartDate: this.parseTaskDate(dto),
          taskStatus: dto.taskStatus,
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
      relations: {
        ...TaskFindOptionsRelation,
      },
      select: { ...TaskFindOptionsSelect },
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

    return taskRepository.save({
      churchId: church.id,
      creatorId: creatorMember.id,
      inChargeId: inChargeMember ? inChargeMember.id : undefined,
      parentTaskId: parentTask ? parentTask.id : undefined,
      taskType: parentTask ? TaskType.subTask : TaskType.parent,
      title: dto.title,
      taskStatus: dto.taskStatus,
      taskStartDate: dto.taskStartDate,
      taskEndDate: dto.taskEndDate,
      comment: dto.comment,
    });
  }
}
