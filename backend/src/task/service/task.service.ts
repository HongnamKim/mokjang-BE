import { Inject, Injectable } from '@nestjs/common';
import {
  ITASK_DOMAIN_SERVICE,
  ITaskDomainService,
} from '../task-domain/interface/task-domain.service.interface';
import { CreateTaskDto } from '../dto/request/create-task.dto';
import { QueryRunner } from 'typeorm';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { PostTaskResponseDto } from '../dto/response/post-task-response.dto';
import { TaskTreeEnum } from '../const/task-tree.enum';
import { GetTaskResponseDto } from '../dto/response/get-task-response.dto';
import { GetTasksDto } from '../dto/request/get-tasks.dto';
import { TaskPaginationResultDto } from '../dto/response/task-pagination-result.dto';
import { UpdateTaskDto } from '../dto/request/update-task.dto';
import { PatchTaskResponseDto } from '../dto/response/patch-task-response.dto';
import { DeleteTaskResponseDto } from '../dto/response/delete-task-response.dto';

@Injectable()
export class TaskService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(ITASK_DOMAIN_SERVICE)
    private readonly taskDomainService: ITaskDomainService,
  ) {}

  async getTasks(churchId: number, dto: GetTasksDto, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const result = await this.taskDomainService.findTasks(church, dto, qr);

    return new TaskPaginationResultDto(
      result.data,
      result.totalCount,
      result.data.length,
      dto.page,
      Math.ceil(result.totalCount / dto.take),
    );
  }

  async postTask(
    churchId: number,
    creatorUserId: number,
    dto: CreateTaskDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const creatorMember =
      await this.membersDomainService.findMemberModelByUserId(
        church,
        creatorUserId,
        qr,
      );

    const inChargeMember = dto.inChargeId
      ? await this.membersDomainService.findMemberModelById(
          church,
          dto.inChargeId,
          qr,
          { user: true },
        )
      : null;

    // 업무 담당자 권한 체크
    inChargeMember &&
      this.taskDomainService.assertValidInChargeMember(inChargeMember);

    // 상위 업무
    const parentTask = dto.parentTaskId
      ? await this.taskDomainService.findTaskModelById(
          church,
          dto.parentTaskId,
          TaskTreeEnum.parent,
          qr,
        )
      : null;

    const newTask = await this.taskDomainService.createTask(
      church,
      creatorMember,
      parentTask,
      inChargeMember,
      dto,
      qr,
    );

    return new PostTaskResponseDto(newTask, new Date());
  }

  async getTaskById(churchId: number, taskId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const task = await this.taskDomainService.findTaskById(church, taskId);

    return new GetTaskResponseDto(task, new Date());
  }

  async patchTask(
    churchId: number,
    taskId: number,
    dto: UpdateTaskDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetTask = await this.taskDomainService.findTaskModelById(
      church,
      taskId,
      undefined,
      qr,
      {
        subTasks: true,
      },
    );

    const newInChargeMember = dto.inChargeId
      ? await this.membersDomainService.findMemberModelById(
          church,
          dto.inChargeId,
          qr,
          { user: true },
        )
      : null;

    newInChargeMember &&
      this.taskDomainService.assertValidInChargeMember(newInChargeMember);

    const newParentTask = dto.parentTaskId
      ? await this.taskDomainService.findTaskModelById(
          church,
          dto.parentTaskId,
          TaskTreeEnum.parent,
          qr,
        )
      : null;

    await this.taskDomainService.updateTask(
      targetTask,
      newInChargeMember,
      newParentTask,
      dto,
      qr,
    );

    const updatedTask = await this.taskDomainService.findTaskById(
      church,
      targetTask.id,
      qr,
    );

    return new PatchTaskResponseDto(updatedTask);
  }

  async deleteTask(churchId: number, taskId: number, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetTask = await this.taskDomainService.findTaskModelById(
      church,
      taskId,
      TaskTreeEnum.none,
      qr,
    );

    // 업무 삭제
    await this.taskDomainService.deleteTask(targetTask, qr);

    // 업무 보고 삭제

    return new DeleteTaskResponseDto(
      new Date(),
      targetTask.id,
      targetTask.title,
      true,
    );
  }
}
