import { Injectable } from '@nestjs/common';
import { EducationSessionModel } from '../entity/education-session.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../../../notification/const/notification-event.enum';
import {
  NotificationEventDto,
  NotificationField,
  NotificationFields,
  NotificationSourceEducationSession,
} from '../../../notification/notification-event.dto';
import { NotificationDomain } from '../../../notification/const/notification-domain.enum';
import { NotificationAction } from '../../../notification/const/notification-action.enum';
import { EducationSessionStatus } from '../const/education-session-status.enum';
import { UpdateEducationSessionDto } from '../dto/request/update-education-session.dto';

@Injectable()
export class EducationSessionNotificationService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  notifyPost(
    newSession: EducationSessionModel,
    creatorManager: ChurchUserModel,
    inCharge: ChurchUserModel,
    sessionTitle: string,
    educationId: number,
    educationTermId: number,
  ) {
    const actorName = creatorManager.member.name;

    this.eventEmitter.emit(
      NotificationEvent.EDUCATION_SESSION_IN_CHARGE_ADDED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_SESSION,
        NotificationAction.IN_CHARGE_ADDED,
        sessionTitle,
        new NotificationSourceEducationSession(
          NotificationDomain.EDUCATION_SESSION,
          educationId,
          educationTermId,
          newSession.id,
        ),
        [inCharge],
        [],
      ),
    );
  }

  notifyReportAdded(
    session: EducationSessionModel,
    requestManager: ChurchUserModel,
    newReceivers: ChurchUserModel[],
    sessionTitle: string,
    educationId: number,
    educationTermId: number,
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = newReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.EDUCATION_SESSION_REPORT_ADDED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_SESSION,
        NotificationAction.REPORT_ADDED,
        sessionTitle,
        new NotificationSourceEducationSession(
          NotificationDomain.EDUCATION_SESSION,
          educationId,
          educationTermId,
          session.id,
        ),
        notificationReceivers,
        [],
      ),
    );
  }

  notifyReportRemoved(
    session: EducationSessionModel,
    requestManager: ChurchUserModel,
    removedReportReceivers: ChurchUserModel[],
    sessionTitle: string,
    educationId: number,
    educationTermId: number,
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = removedReportReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.EDUCATION_SESSION_REPORT_REMOVED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_SESSION,
        NotificationAction.REPORT_REMOVED,
        sessionTitle,
        new NotificationSourceEducationSession(
          NotificationDomain.EDUCATION_SESSION,
          educationId,
          educationTermId,
          session.id,
        ),
        notificationReceivers,
        [],
      ),
    );
  }

  notifyStatusUpdate(
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
    sessionTitle: string,
    notificationSource: NotificationSourceEducationSession,
    previousStatus: EducationSessionStatus,
    newStatus: EducationSessionStatus,
  ) {
    // 요청자 알림에서 제외
    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    const actorName = requestManager.member.name;

    this.eventEmitter.emit(
      NotificationEvent.EDUCATION_SESSION_STATUS_UPDATED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_SESSION,
        NotificationAction.STATUS_UPDATED,
        sessionTitle,
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
    notificationSource: NotificationSourceEducationSession,
  ) {
    const actorName = requestManager.member.name;

    // 이전 담당자 제외 알림
    if (oldInCharge && oldInCharge.id !== requestManager.id) {
      this.eventEmitter.emit(
        NotificationEvent.EDUCATION_SESSION_IN_CHARGE_REMOVED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.EDUCATION_SESSION,
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
        NotificationEvent.EDUCATION_SESSION_REPORT_ADDED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.EDUCATION_SESSION,
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
      NotificationEvent.EDUCATION_SESSION_IN_CHARGE_CHANGED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_SESSION,
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
    notificationReceivers: ChurchUserModel[], // 담당자 + 보고대상자
    notificationTitle: string,
    notificationSource: NotificationSourceEducationSession,
    educationSession: EducationSessionModel,
    dto: UpdateEducationSessionDto,
  ) {
    const actorName = requestManager.member.name;

    // 변경자 알림 대상에서 제외
    const notificationTargets = notificationReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    const notificationColumns = [
      'title',
      'startDate',
      'endDate',
      'content', // 변경 여부만 표시
    ];

    const notificationFields: NotificationFields[] = [];

    for (const key of Object.keys(dto)) {
      if (!notificationColumns.includes(key)) {
        continue;
      }

      if (key === 'content') {
        if (dto.content !== educationSession.content)
          notificationFields.push(
            new NotificationFields('content', null, null),
          );
      } else if (key === 'startDate' && dto.utcStartDate) {
        if (
          dto.utcStartDate.getTime() !== educationSession.startDate.getTime()
        ) {
          // 시작 시간 변경
          notificationFields.push(
            new NotificationFields(
              NotificationField.START_DATE,
              educationSession.startDate,
              dto.utcStartDate,
            ),
          );
        }
      } else if (key === 'endDate' && dto.utcEndDate) {
        if (dto.utcEndDate.getTime() !== educationSession.endDate.getTime()) {
          // 종료 시간 변경
          notificationFields.push(
            new NotificationFields(
              NotificationField.END_DATE,
              educationSession.endDate,
              dto.utcEndDate,
            ),
          );
        }
      } else {
        if (dto[key] !== educationSession[key]) {
          notificationFields.push(
            new NotificationFields(key, educationSession[key], dto[key]),
          );
        }
      }
    }

    notificationFields.length > 0 &&
      this.eventEmitter.emit(
        NotificationEvent.EDUCATION_SESSION_DATA_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.EDUCATION_SESSION,
          NotificationAction.UPDATED,
          notificationTitle,
          notificationSource,
          notificationTargets,
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
      NotificationEvent.EDUCATION_SESSION_DELETED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_SESSION,
        NotificationAction.DELETED,
        notificationTitle,
        null,
        notificationReceivers,
        [],
      ),
    );
  }
}
