import { Inject, Injectable } from '@nestjs/common';
import { ChurchModel } from '../../churches/entity/church.entity';
import { TaskModel } from '../entity/task.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { UpdateTaskDto } from '../dto/request/update-task.dto';
import { QueryRunner } from 'typeorm';
import {
  NotificationEventDto,
  NotificationField,
  NotificationFields,
  NotificationSourceTask,
} from '../../notification/notification-event.dto';
import { NotificationEvent } from '../../notification/const/notification-event.enum';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';
import { NotificationAction } from '../../notification/const/notification-action.enum';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TaskNotificationService {
  constructor(
    private readonly eventEmitter: EventEmitter2,

    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
  ) {}

  private async getReportReceivers(
    church: ChurchModel,
    task: TaskModel,
    qr: QueryRunner,
  ) {
    // 보고대상자
    const reportReceiverIds = task.reports.map((report) => report.receiverId);

    return this.managerDomainService.findManagersForNotification(
      church,
      reportReceiverIds,
      qr,
    );
  }

  notifyPost(
    newTask: TaskModel,
    creatorManager: ChurchUserModel,
    inCharge: ChurchUserModel,
  ) {
    this.eventEmitter.emit(
      'task.inCharge.added',
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
    this.eventEmitter.emit(
      NotificationEvent.TASK_REPORT_ADDED,
      new NotificationEventDto(
        requestManager.member.name ? requestManager.member.name : '',
        NotificationDomain.TASK,
        NotificationAction.REPORT_ADDED,
        task.title,
        new NotificationSourceTask(NotificationDomain.TASK, task.id),
        newReceivers,
        [],
      ),
    );
  }

  notifyReportRemoved(
    task: TaskModel,
    requestManager: ChurchUserModel,
    removedReportReceivers: ChurchUserModel[],
  ) {
    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';

    this.eventEmitter.emit(
      NotificationEvent.TASK_REPORT_REMOVED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.TASK,
        NotificationAction.REPORT_REMOVED,
        task.title,
        new NotificationSourceTask(NotificationDomain.TASK, task.id),
        removedReportReceivers,
        [],
      ),
    );
  }

  async notifyUpdate(
    church: ChurchModel,
    targetTask: TaskModel,
    newInChargeMember: ChurchUserModel | null,
    requestManager: ChurchUserModel,
    dto: UpdateTaskDto,
    qr: QueryRunner,
  ) {
    // 담당자 (새 담당자 or 기존 담당자)
    const inCharge = dto.inChargeId
      ? newInChargeMember
      : await this.managerDomainService.findManagerByMemberId(
          church,
          targetTask.inChargeId,
          qr,
        );

    // 보고 대상자
    const reportReceivers = await this.getReportReceivers(
      church,
      targetTask,
      qr,
    );

    // 요청자 이름
    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';
    const notificationTitle = dto.title ? dto.title : targetTask.title;
    const notificationSource = new NotificationSourceTask(
      NotificationDomain.TASK,
      targetTask.id,
    );

    // 변경 요청자가 알림 대상자에 있을 경우 제외
    const notificationTarget = (
      inCharge ? [...reportReceivers, inCharge] : reportReceivers
    ).filter((target) => target.id !== requestManager.id);

    const notificationFields: NotificationFields[] = [];

    // 변경 사항 알림 (담당자, 내용 제외)
    for (const key of Object.keys(dto)) {
      if (
        key === 'inChargeId' ||
        key === 'content' ||
        key === 'utcStartDate' ||
        key === 'utcEndDate'
      ) {
        continue;
      }
      // 상태 변경일 경우 별도 알림
      if (key === 'status' && dto.status !== targetTask.status) {
        this.eventEmitter.emit(
          NotificationEvent.TASK_STATUS_UPDATED,
          new NotificationEventDto(
            actorName,
            NotificationDomain.TASK,
            NotificationAction.STATUS_UPDATED,
            notificationTitle,
            notificationSource,
            notificationTarget,
            [
              new NotificationFields(
                NotificationField.STATUS,
                targetTask.status,
                dto.status,
              ),
            ],
          ),
        );
      } else if (dto[key] !== targetTask[key]) {
        if (key === 'startDate') {
          const fieldUpdated = new NotificationFields(
            key,
            targetTask[key],
            dto.utcStartDate,
          );

          notificationFields.push(fieldUpdated);
        } else if (key === 'endDate') {
          const fieldUpdated = new NotificationFields(
            key,
            targetTask[key],
            dto.utcEndDate,
          );

          notificationFields.push(fieldUpdated);
        } else {
          const fieldUpdated = new NotificationFields(
            key,
            targetTask[key],
            dto[key],
          );

          notificationFields.push(fieldUpdated);
        }
      }
    }

    notificationFields.length > 0 &&
      this.eventEmitter.emit(
        NotificationEvent.TASK_META_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.TASK,
          NotificationAction.UPDATED,
          notificationTitle,
          notificationSource,
          notificationTarget,
          notificationFields,
        ),
      );

    // 담당자 변경 알림
    if (dto.inChargeId && newInChargeMember) {
      const previousInCharge =
        await this.managerDomainService.findManagerByMemberId(
          church,
          targetTask.inChargeId,
          qr,
        );

      // 이전 담당자 제외 알림
      if (previousInCharge.id !== requestManager.id) {
        this.eventEmitter.emit(
          NotificationEvent.TASK_IN_CHARGE_REMOVED,
          new NotificationEventDto(
            actorName,
            NotificationDomain.TASK,
            NotificationAction.IN_CHARGE_REMOVED,
            notificationTitle,
            notificationSource,
            [previousInCharge],
            [],
          ),
        );
      }

      // 새로운 담당자 지정 알림
      if (newInChargeMember.id !== requestManager.id) {
        this.eventEmitter.emit(
          NotificationEvent.TASK_IN_CHARGE_ADDED,
          new NotificationEventDto(
            actorName,
            NotificationDomain.TASK,
            NotificationAction.IN_CHARGE_ADDED,
            notificationTitle,
            notificationSource,
            [newInChargeMember],
            [],
          ),
        );
      }

      const inChargeNotificationTargets = reportReceivers.filter(
        (target) => target.id !== requestManager.id,
      );

      // 담당자 변경 알림
      this.eventEmitter.emit(
        NotificationEvent.TASK_IN_CHARGE_CHANGED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.TASK,
          NotificationAction.IN_CHARGE_CHANGED,
          notificationTitle,
          notificationSource,
          inChargeNotificationTargets,
          [
            new NotificationFields(
              NotificationField.IN_CHARGE,
              previousInCharge.member.name,
              newInChargeMember?.member.name,
            ),
          ],
        ),
      );
    }
  }

  async notifyDelete(
    church: ChurchModel,
    targetTask: TaskModel,
    requestManager: ChurchUserModel,
    qr: QueryRunner,
  ) {
    // 요청자 이름
    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';

    const receiverIds = targetTask.reports.map((report) => report.receiverId);

    const notificationReceiverIds = [
      targetTask.inChargeId,
      ...receiverIds,
    ].filter((id) => id);

    const notificationReceivers =
      await this.managerDomainService.findManagersForNotification(
        church,
        notificationReceiverIds,
        qr,
      );

    this.eventEmitter.emit(
      NotificationEvent.TASK_DELETED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.TASK,
        NotificationAction.DELETED,
        targetTask.title,
        null,
        notificationReceivers,
        [],
      ),
    );
  }
}
