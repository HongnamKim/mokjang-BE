import { Injectable } from '@nestjs/common';
import { TaskModel } from '../entity/task.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { UpdateTaskDto } from '../dto/request/update-task.dto';
import {
  NotificationEventDto,
  NotificationField,
  NotificationFields,
  NotificationSourceTask,
} from '../../notification/notification-event.dto';
import { NotificationEvent } from '../../notification/const/notification-event.enum';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';
import { NotificationAction } from '../../notification/const/notification-action.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskStatus } from '../const/task-status.enum';

@Injectable()
export class TaskNotificationService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  notifyPost(
    newTask: TaskModel,
    creatorManager: ChurchUserModel,
    inCharge: ChurchUserModel,
  ) {
    this.eventEmitter.emit(
      NotificationEvent.TASK_IN_CHARGE_ADDED,
      new NotificationEventDto(
        creatorManager.member.name ? creatorManager.member.name : '',
        NotificationDomain.TASK,
        NotificationAction.IN_CHARGE_ADDED,
        newTask.title,
        new NotificationSourceTask(NotificationDomain.TASK, newTask.id),
        [inCharge],
        [],
      ),
    );
  }

  notifyReportAdded(
    task: TaskModel,
    requestManager: ChurchUserModel,
    newReceivers: ChurchUserModel[],
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = newReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.TASK_REPORT_ADDED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.TASK,
        NotificationAction.REPORT_ADDED,
        task.title,
        new NotificationSourceTask(NotificationDomain.TASK, task.id),
        notificationReceivers,
        [],
      ),
    );
  }

  notifyReportRemoved(
    task: TaskModel,
    requestManager: ChurchUserModel,
    removedReportReceivers: ChurchUserModel[],
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = removedReportReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.TASK_REPORT_REMOVED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.TASK,
        NotificationAction.REPORT_REMOVED,
        task.title,
        new NotificationSourceTask(NotificationDomain.TASK, task.id),
        notificationReceivers,
        [],
      ),
    );
  }

  notifyStatusUpdate(
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
    notificationTitle: string,
    notificationSource: NotificationSourceTask,
    previousStatus: TaskStatus,
    newStatus: TaskStatus,
  ) {
    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    const actorName = requestManager.member.name;

    this.eventEmitter.emit(
      NotificationEvent.TASK_STATUS_UPDATED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.TASK,
        NotificationAction.STATUS_UPDATED,
        notificationTitle,
        notificationSource,
        notificationReceivers,
        [
          new NotificationFields(
            NotificationField.STATUS,
            previousStatus,
            newStatus,
          ),
        ],
      ),
    );
  }

  notifyInChargeUpdate(
    requestManager: ChurchUserModel,
    reportReceivers: ChurchUserModel[],
    oldInCharge: ChurchUserModel | null,
    newInCharge: ChurchUserModel,
    notificationTitle: string,
    notificationSource: NotificationSourceTask,
  ) {
    const actorName = requestManager.member.name;

    // 이전 담당자 제외 알림
    if (oldInCharge && oldInCharge.id !== requestManager.id) {
      this.eventEmitter.emit(
        NotificationEvent.TASK_IN_CHARGE_REMOVED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.TASK,
          NotificationAction.IN_CHARGE_REMOVED,
          notificationTitle,
          notificationSource,
          [oldInCharge],
          [],
        ),
      );
    }

    // 새 담당자 지정 알림
    if (newInCharge.id !== requestManager.id) {
      this.eventEmitter.emit(
        NotificationEvent.TASK_IN_CHARGE_ADDED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.TASK,
          NotificationAction.IN_CHARGE_ADDED,
          notificationTitle,
          notificationSource,
          [newInCharge],
          [],
        ),
      );
    }

    const notificationReceivers = reportReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.TASK_IN_CHARGE_CHANGED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.TASK,
        NotificationAction.IN_CHARGE_CHANGED,
        notificationTitle,
        notificationSource,
        notificationReceivers,
        [
          new NotificationFields(
            NotificationField.IN_CHARGE,
            oldInCharge?.member.name,
            newInCharge.member.name,
          ),
        ],
      ),
    );
  }

  notifyDataUpdate(
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
    notificationTitle: string,
    notificationSource: NotificationSourceTask,
    targetTask: TaskModel,
    dto: UpdateTaskDto,
  ) {
    // 요청자 이름
    const actorName = requestManager.member.name;

    const notificationReceivers = notificationTargets.filter(
      (r) => r.id !== requestManager.id,
    );

    const notificationColumns = new Set([
      'title',
      'startDate',
      'endDate',
      'content', // 변경 여부만 표시
    ]);

    const notificationFields: NotificationFields[] = [];

    for (const key of Object.keys(dto)) {
      if (!notificationColumns.has(key)) {
        continue;
      }

      if (key === 'content') {
        if (dto.content !== targetTask.content) {
          notificationFields.push(new NotificationFields(key, null, null));
        }
      } else if (key === 'startDate' && dto.utcStartDate) {
        if (dto.utcStartDate.getTime() !== targetTask.startDate.getTime()) {
          notificationFields.push(
            new NotificationFields(
              NotificationField.START_DATE,
              targetTask.startDate,
              dto.utcStartDate,
            ),
          );
        }
      } else if (key === 'endDate' && dto.utcEndDate) {
        if (dto.utcEndDate.getTime() !== targetTask.endDate.getTime()) {
          notificationFields.push(
            new NotificationFields(
              NotificationField.END_DATE,
              targetTask.endDate,
              dto.utcEndDate,
            ),
          );
        }
      } else {
        if (dto[key] !== targetTask[key]) {
          notificationFields.push(
            new NotificationFields(key, targetTask[key], dto[key]),
          );
        }
      }
    }

    notificationFields.length > 0 &&
      this.eventEmitter.emit(
        NotificationEvent.TASK_DATA_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.TASK,
          NotificationAction.UPDATED,
          notificationTitle,
          notificationSource,
          notificationReceivers,
          notificationFields,
        ),
      );
  }

  notifyDelete(
    notificationTitle: string,
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
  ) {
    // 요청자 이름
    const actorName = requestManager.member.name;

    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.TASK_DELETED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.TASK,
        NotificationAction.DELETED,
        notificationTitle,
        null,
        notificationReceivers,
        [],
      ),
    );
  }
}
