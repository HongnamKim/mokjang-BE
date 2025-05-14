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
import { AddTaskReportReceiverDto } from '../../report/dto/task-report/request/add-task-report-receiver.dto';
import { TaskReportException } from '../../report/const/exception/task-report.exception';
import {
  ITASK_REPORT_DOMAIN_SERVICE,
  ITaskReportDomainService,
} from '../../report/report-domain/interface/task-report-domain.service.interface';
import { DeleteTaskReportReceiverDto } from '../../report/dto/task-report/request/delete-task-report-receiver.dto';
import { RemoveConflictException } from '../../common/exception/remove-conflict.exception';
import { ChurchModel } from '../../churches/entity/church.entity';

@Injectable()
export class TaskService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

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

    if (dto.receiverIds.length > 0) {
      await this.handleAddTaskReport(church, newTask.id, dto.receiverIds, qr);
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
      { reports: true },
    );

    // 업무 삭제
    await this.taskDomainService.deleteTask(targetTask, qr);

    // 업무 보고 삭제
    await this.taskReportDomainService.deleteTaskReports(
      targetTask.reports,
      qr,
    );

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

    return this.handleAddTaskReport(church, taskId, dto.receiverIds, qr);
  }

  private async handleAddTaskReport(
    church: ChurchModel,
    taskId: number,
    newReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const task = await this.taskDomainService.findTaskModelById(
      church,
      taskId,
      TaskTreeEnum.none,
      qr,
      { inCharge: true, reports: true },
    );

    const newReceivers = await this.membersDomainService.findMembersById(
      church,
      newReceiverIds,
      qr,
      { user: true },
    );

    await this.taskReportDomainService.createTaskReports(
      task,
      task.inCharge,
      newReceivers,
      qr,
    );

    return {
      taskId: task.id,
      addReceivers: newReceivers.map((receiver) => ({
        id: receiver.id,
        name: receiver.name,
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
      TaskTreeEnum.none,
      qr,
      { reports: { receiver: true } },
    );

    const reports = task.reports;
    const oldReceiverIds = new Set(reports.map((report) => report.receiverId));

    const notExistReceiverIds = dto.receiverIds.filter(
      (id) => !oldReceiverIds.has(id),
    );

    if (notExistReceiverIds.length > 0) {
      throw new RemoveConflictException(
        TaskReportException.NOT_EXIST_REPORTED_MEMBER,
        notExistReceiverIds,
      );
    }

    const deleteReports = reports.filter((report) =>
      dto.receiverIds.includes(report.receiverId),
    );

    const result = await this.taskReportDomainService.deleteTaskReports(
      deleteReports,
      qr,
    );

    return {
      taskId,
      deletedReceivers: deleteReports.map((r) => ({
        id: r.receiverId,
        name: r.receiver.name,
      })),
      deletedCount: result.affected,
    };
  }
}
