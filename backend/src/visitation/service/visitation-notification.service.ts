import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { NotificationEvent } from '../../notification/const/notification-event.enum';
import {
  NotificationEventDto,
  NotificationField,
  NotificationFields,
  NotificationSourceVisitation,
} from '../../notification/notification-event.dto';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';
import { NotificationAction } from '../../notification/const/notification-action.enum';
import { VisitationStatus } from '../const/visitation-status.enum';
import { UpdateVisitationDto } from '../dto/request/update-visitation.dto';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';

@Injectable()
export class VisitationNotificationService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  notifyPost(
    newVisitation: VisitationMetaModel,
    creatorManager: ChurchUserModel,
    inCharge: ChurchUserModel,
  ) {
    const actorName = creatorManager.member.name;

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_IN_CHARGE_ADDED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
        NotificationAction.IN_CHARGE_ADDED,
        newVisitation.title,
        new NotificationSourceVisitation(
          NotificationDomain.VISITATION,
          newVisitation.id,
        ),
        [inCharge],
        [],
      ),
    );
  }

  notifyReportAdded(
    visitation: VisitationMetaModel,
    requestManager: ChurchUserModel,
    newReceivers: ChurchUserModel[],
  ) {
    const actorName = requestManager.member.name;

    const notificationTargets = newReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_REPORT_ADDED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
        NotificationAction.REPORT_ADDED,
        visitation.title,
        new NotificationSourceVisitation(
          NotificationDomain.VISITATION,
          visitation.id,
        ),
        notificationTargets,
        [],
      ),
    );
  }

  notifyReportRemoved(
    visitation: VisitationMetaModel,
    requestManager: ChurchUserModel,
    removedReportReceivers: ChurchUserModel[],
  ) {
    const actorName = requestManager.member.name;

    const notificationTargets = removedReportReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_REPORT_REMOVED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
        NotificationAction.REPORT_REMOVED,
        visitation.title,
        new NotificationSourceVisitation(
          NotificationDomain.VISITATION,
          visitation.id,
        ),
        notificationTargets,
        [],
      ),
    );
  }

  notifyStatusUpdate(
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
    notificationTitle: string,
    notificationSource: NotificationSourceVisitation,
    previousStatus: VisitationStatus,
    newStatus: VisitationStatus,
  ) {
    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    const actorName = requestManager.member.name;

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_STATUS_UPDATED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
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
    notificationSource: NotificationSourceVisitation,
  ) {
    const actorName = requestManager.member.name;

    // 이전 담당자 제외 알림
    if (oldInCharge && oldInCharge.id !== requestManager.id) {
      this.eventEmitter.emit(
        NotificationEvent.VISITATION_IN_CHARGE_REMOVED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.VISITATION,
          NotificationAction.IN_CHARGE_ADDED,
          notificationTitle,
          notificationSource,
          [newInCharge],
          [],
        ),
      );
    }

    // 새 담당자 지정 알림
    if (newInCharge.id !== requestManager.id) {
      this.eventEmitter.emit(
        NotificationEvent.VISITATION_IN_CHARGE_ADDED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.VISITATION,
          NotificationAction.IN_CHARGE_ADDED,
          notificationTitle,
          notificationSource,
          [newInCharge],
          [],
        ),
      );
    }

    // 보고대상자에게 담당자 변경 알림
    const notificationReceivers = reportReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_IN_CHARGE_CHANGED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
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

  notifyMemberUpdate(
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
    notificationTitle: string,
    notificationSource: NotificationSourceVisitation,
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_DATA_UPDATED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
        NotificationAction.UPDATED,
        notificationTitle,
        notificationSource,
        notificationReceivers,
        [new NotificationFields('members', null, null)],
      ),
    );
  }

  notifyDataUpdate(
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
    notificationTitle: string,
    notificationSource: NotificationSourceVisitation,
    targetVisitation: VisitationMetaModel,
    dto: UpdateVisitationDto,
  ) {
    const actorName = requestManager.member.name;

    // 알림 수신 대상자
    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    const notificationColumns = [
      'title',
      'startDate',
      'endDate',
      'visitationMethod',
    ];

    const notificationFields: NotificationFields[] = [];

    // 업데이트 사항 체크
    for (const key of Object.keys(dto)) {
      if (!notificationColumns.includes(key)) {
        continue;
      }

      // 제목 변경
      if (key === 'startDate' && dto.startDate) {
        const utcStartDate = fromZonedTime(dto.startDate, TIME_ZONE.SEOUL);
        if (utcStartDate.getTime() !== targetVisitation.startDate.getTime()) {
          notificationFields.push(
            new NotificationFields(
              key,
              targetVisitation.startDate,
              utcStartDate,
            ),
          );
        }
      } else if (key === 'endDate' && dto.endDate) {
        const utcEndDate = fromZonedTime(dto.endDate, TIME_ZONE.SEOUL);
        if (utcEndDate.getTime() !== targetVisitation.startDate.getTime()) {
          notificationFields.push(
            new NotificationFields(key, targetVisitation.endDate, utcEndDate),
          );
        }
      } else {
        if (dto[key] !== targetVisitation[key]) {
          notificationFields.push(
            new NotificationFields(key, targetVisitation[key], dto[key]),
          );
        }
      }
    }

    notificationFields.length > 0 &&
      this.eventEmitter.emit(
        NotificationEvent.VISITATION_DATA_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.VISITATION,
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
    const actorName = requestManager.member.name;

    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_DELETED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
        NotificationAction.DELETED,
        notificationTitle,
        null,
        notificationReceivers,
        [],
      ),
    );
  }
}
