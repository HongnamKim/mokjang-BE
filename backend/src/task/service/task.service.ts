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
import { AddTaskReportReceiverDto } from '../../report/task-report/dto/request/add-task-report-receiver.dto';
import {
  ITASK_REPORT_DOMAIN_SERVICE,
  ITaskReportDomainService,
} from '../../report/task-report/task-report-domain/interface/task-report-domain.service.interface';
import { DeleteTaskReportReceiverDto } from '../../report/task-report/dto/request/delete-task-report-receiver.dto';
import {
  ChurchModel,
  ManagementCountType,
} from '../../churches/entity/church.entity';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { GetSubTaskResponseDto } from '../dto/response/get-sub-task-response.dto';
import { TaskModel } from '../entity/task.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { TaskNotificationService } from './task-notification.service';
import { NotificationSourceTask } from '../../notification/notification-event.dto';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskNotificationService: TaskNotificationService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

    @Inject(ITASK_DOMAIN_SERVICE)
    private readonly taskDomainService: ITaskDomainService,
    @Inject(ITASK_REPORT_DOMAIN_SERVICE)
    private readonly taskReportDomainService: ITaskReportDomainService,
  ) {}

  async getTasks(church: ChurchModel, dto: GetTasksDto, qr?: QueryRunner) {
    const result = await this.taskDomainService.findTasks(church, dto, qr);

    return new TaskPaginationResultDto(result);
  }

  async getSubTasks(church: ChurchModel, taskId: number, qr?: QueryRunner) {
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
    church: ChurchModel,
    creatorManager: ChurchUserModel,
    dto: CreateTaskDto,
    qr: QueryRunner,
  ) {
    const inCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerByMemberId(
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

    dto.utcStartDate = fromZonedTime(dto.startDate, TIME_ZONE.SEOUL);
    dto.utcEndDate = fromZonedTime(dto.endDate, TIME_ZONE.SEOUL);

    const newTask = await this.taskDomainService.createTask(
      church,
      creatorManager,
      parentTask,
      inCharge,
      dto,
      qr,
    );

    if (inCharge) {
      this.taskNotificationService.notifyPost(
        newTask,
        creatorManager,
        inCharge,
      );
    }

    if (dto.receiverIds && dto.receiverIds.length > 0) {
      await this.handleAddTaskReport(
        church,
        newTask,
        creatorManager,
        dto.receiverIds,
        qr,
      );
    }

    return new PostTaskResponseDto(newTask, new Date());
  }

  async getTaskById(church: ChurchModel, taskId: number) {
    const task = await this.taskDomainService.findTaskById(church, taskId);

    return new GetTaskResponseDto(task, new Date());
  }

  async patchTask(
    requestManager: ChurchUserModel,
    church: ChurchModel,
    taskId: number,
    dto: UpdateTaskDto,
    qr: QueryRunner,
  ) {
    const targetTask = await this.taskDomainService.findTaskModelById(
      church,
      taskId,
      qr,
      {
        subTasks: true,
        reports: true,
      },
    );

    const newInCharge =
      dto.inChargeId && dto.inChargeId !== targetTask.inChargeId
        ? await this.managerDomainService.findManagerByMemberId(
            church,
            dto.inChargeId,
            qr,
          )
        : null;

    const newParentTask =
      dto.parentTaskId && dto.parentTaskId !== targetTask.parentTaskId
        ? await this.taskDomainService.findParentTaskModelById(
            church,
            dto.parentTaskId,
            qr,
          )
        : null;

    dto.utcStartDate = dto.startDate
      ? fromZonedTime(dto.startDate, TIME_ZONE.SEOUL)
      : undefined;
    dto.utcEndDate = dto.endDate
      ? fromZonedTime(dto.endDate, TIME_ZONE.SEOUL)
      : undefined;

    await this.taskDomainService.updateTask(
      targetTask,
      newInCharge,
      newParentTask,
      dto,
      qr,
    );

    const [oldInCharge, reportReceivers] = await Promise.all([
      targetTask.inChargeId
        ? this.managerDomainService.findManagerForNotification(
            church,
            targetTask.inChargeId,
          )
        : null,
      this.managerDomainService.findManagersForNotification(
        church,
        targetTask.reports.map((r) => r.receiverId),
      ),
    ]);

    const notificationSource = new NotificationSourceTask(
      NotificationDomain.TASK,
      targetTask.id,
    );

    let notificationTargets: ChurchUserModel[];

    if (newInCharge) {
      notificationTargets = reportReceivers;
    } else {
      notificationTargets = oldInCharge
        ? [...reportReceivers, oldInCharge]
        : reportReceivers;
    }

    // 상태 변경 알림
    if (dto.status && dto.status !== targetTask.status) {
      this.taskNotificationService.notifyStatusUpdate(
        requestManager,
        notificationTargets,
        targetTask.title,
        notificationSource,
        targetTask.status,
        dto.status,
      );
    }

    // 담당자 변경 알림
    if (newInCharge) {
      this.taskNotificationService.notifyInChargeUpdate(
        requestManager,
        reportReceivers,
        oldInCharge,
        newInCharge,
        targetTask.title,
        notificationSource,
      );
    }

    this.taskNotificationService.notifyDataUpdate(
      requestManager,
      notificationTargets,
      targetTask.title,
      notificationSource,
      targetTask,
      dto,
    );

    const updatedTask = await this.taskDomainService.findTaskById(
      church,
      targetTask.id,
      qr,
    );

    return new PatchTaskResponseDto(updatedTask);
  }

  async deleteTask(
    requestManager: ChurchUserModel,
    church: ChurchModel,
    taskId: number,
    qr: QueryRunner,
  ) {
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

    const [reportReceivers, inCharge] = await Promise.all([
      this.managerDomainService.findManagersForNotification(
        church,
        targetTask.reports.map((r) => r.receiverId),
      ),
      this.managerDomainService.findManagerForNotification(
        church,
        targetTask.inChargeId,
      ),
    ]);

    const notificationTargets = inCharge
      ? [...reportReceivers, inCharge]
      : reportReceivers;

    this.taskNotificationService.notifyDelete(
      targetTask.title,
      requestManager,
      notificationTargets,
    );

    return new DeleteTaskResponseDto(
      new Date(),
      targetTask.id,
      targetTask.title,
      true,
    );
  }

  async addTaskReportReceivers(
    church: ChurchModel,
    taskId: number,
    requestManager: ChurchUserModel,
    dto: AddTaskReportReceiverDto,
    qr: QueryRunner,
  ) {
    const task = await this.taskDomainService.findTaskModelById(
      church,
      taskId,
      qr,
    );

    return this.handleAddTaskReport(
      church,
      task,
      requestManager,
      dto.receiverIds,
      qr,
    );
  }

  private async handleAddTaskReport(
    church: ChurchModel,
    task: TaskModel,
    requestManager: ChurchUserModel,
    newReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const newReceivers =
      await this.managerDomainService.findManagersByMemberIds(
        church,
        newReceiverIds,
        qr,
      );

    await this.taskReportDomainService.createTaskReports(
      task,
      newReceivers,
      qr,
    );

    this.taskNotificationService.notifyReportAdded(
      task,
      requestManager,
      newReceivers,
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
    church: ChurchModel,
    taskId: number,
    requestManager: ChurchUserModel,
    dto: DeleteTaskReportReceiverDto,
    qr: QueryRunner,
  ) {
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

    const removedReportReceivers =
      await this.managerDomainService.findManagersForNotification(
        church,
        dto.receiverIds,
        qr,
      );

    this.taskNotificationService.notifyReportRemoved(
      task,
      requestManager,
      removedReportReceivers,
    );

    return {
      taskId,
      deletedReceiverIds: dto.receiverIds,
      deletedCount: result.affected,
    };
  }

  async refreshTaskCount(church: ChurchModel, qr: QueryRunner) {
    const taskCount = await this.taskDomainService.countAllTasks(church, qr);

    await this.churchesDomainService.refreshManagementCount(
      church,
      ManagementCountType.TASK,
      taskCount,
      qr,
    );

    return { taskCount };
  }
}
