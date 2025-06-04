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
import { PostTaskResponseDto } from '../dto/response/post-task-response.dto';
import { GetTaskResponseDto } from '../dto/response/get-task-response.dto';
import { GetTasksDto } from '../dto/request/get-tasks.dto';
import { TaskPaginationResultDto } from '../dto/response/task-pagination-result.dto';
import { UpdateTaskDto } from '../dto/request/update-task.dto';
import { PatchTaskResponseDto } from '../dto/response/patch-task-response.dto';
import { DeleteTaskResponseDto } from '../dto/response/delete-task-response.dto';
import { AddTaskReportReceiverDto } from '../../report/dto/task-report/request/add-task-report-receiver.dto';
import {
  ITASK_REPORT_DOMAIN_SERVICE,
  ITaskReportDomainService,
} from '../../report/report-domain/interface/task-report-domain.service.interface';
import { DeleteTaskReportReceiverDto } from '../../report/dto/task-report/request/delete-task-report-receiver.dto';
import { ChurchModel } from '../../churches/entity/church.entity';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { GetSubTaskResponseDto } from '../dto/response/get-sub-task-response.dto';
import { TaskModel } from '../entity/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

    @Inject(ITASK_DOMAIN_SERVICE)
    private readonly taskDomainService: ITaskDomainService,
    @Inject(ITASK_REPORT_DOMAIN_SERVICE)
    private readonly taskReportDomainService: ITaskReportDomainService,
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

  async getSubTasks(churchId: number, taskId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const parentTask = await this.taskDomainService.findParentTaskModelById(
      church,
      taskId,
      qr,
    );

    const subTasks = await this.taskDomainService.findSubTasks(
      church,
      parentTask,
      qr,
    );

    return new GetSubTaskResponseDto(subTasks, taskId);
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

    const creator = await this.managerDomainService.findManagerByUserId(
      church,
      creatorUserId,
      qr,
    );

    const inCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerById(
          church,
          dto.inChargeId,
          qr,
        )
      : null;

    // 상위 업무
    const parentTask = dto.parentTaskId
      ? await this.taskDomainService.findParentTaskModelById(
          church,
          dto.parentTaskId,
          qr,
        )
      : null;

    const newTask = await this.taskDomainService.createTask(
      church,
      creator,
      parentTask,
      inCharge,
      dto,
      qr,
    );

    if (dto.receiverIds && dto.receiverIds.length > 0) {
      await this.handleAddTaskReport(church, newTask, dto.receiverIds, qr);
    }

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
      qr,
      {
        subTasks: true,
      },
    );

    const newInChargeMember = dto.inChargeId
      ? await this.managerDomainService.findManagerById(
          church,
          dto.inChargeId,
          qr,
        )
      : null;

    const newParentTask = dto.parentTaskId
      ? await this.taskDomainService.findParentTaskModelById(
          church,
          dto.parentTaskId,
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
      qr,
      { reports: true },
    );

    // 업무 삭제
    await this.taskDomainService.deleteTask(targetTask, qr);

    // 업무 보고 삭제
    await this.taskReportDomainService.deleteTaskReportCascade(targetTask, qr);

    return new DeleteTaskResponseDto(
      new Date(),
      targetTask.id,
      targetTask.title,
      true,
    );
  }

  async addTaskReportReceivers(
    churchId: number,
    taskId: number,
    dto: AddTaskReportReceiverDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const task = await this.taskDomainService.findTaskModelById(
      church,
      taskId,
      qr,
    );

    return this.handleAddTaskReport(church, task, dto.receiverIds, qr);
  }

  private async handleAddTaskReport(
    church: ChurchModel,
    task: TaskModel,
    newReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const newReceivers = await this.managerDomainService.findManagersByIds(
      church,
      newReceiverIds,
      qr,
    );

    await this.taskReportDomainService.createTaskReports(
      task,
      newReceivers,
      qr,
    );

    return {
      taskId: task.id,
      addReceivers: newReceivers.map((receiver) => ({
        id: receiver.memberId,
        name: receiver.member.name,
      })),
      addedCount: newReceivers.length,
    };
  }

  async deleteTaskReportReceivers(
    churchId: number,
    taskId: number,
    dto: DeleteTaskReportReceiverDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const task = await this.taskDomainService.findTaskModelById(
      church,
      taskId,
      qr,
    );

    const result = await this.taskReportDomainService.deleteTaskReports(
      task,
      dto.receiverIds,
      qr,
    );

    return {
      taskId,
      deletedReceiverIds: dto.receiverIds,
      deletedCount: result.affected,
    };
  }
}
