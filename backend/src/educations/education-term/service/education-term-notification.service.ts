import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EducationTermModel } from '../entity/education-term.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { NotificationEvent } from '../../../notification/const/notification-event.enum';
import {
  NotificationEventDto,
  NotificationField,
  NotificationFields,
  NotificationSourceEducationTerm,
} from '../../../notification/notification-event.dto';
import { NotificationDomain } from '../../../notification/const/notification-domain.enum';
import { NotificationAction } from '../../../notification/const/notification-action.enum';
import { EducationTermStatus } from '../const/education-term-status.enum';
import { UpdateEducationTermDto } from '../dto/request/update-education-term.dto';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { ChurchModel } from '../../../churches/entity/church.entity';

@Injectable()
export class EducationTermNotificationService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
  ) {}

  notifyPost(
    newTerm: EducationTermModel,
    creatorManager: ChurchUserModel,
    inCharge: ChurchUserModel,
    notificationTitle: string,
    educationId: number,
  ) {
    const actorName = creatorManager.member.name;

    this.eventEmitter.emit(
      NotificationEvent.EDUCATION_TERM_IN_CHARGE_ADDED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_TERM,
        NotificationAction.IN_CHARGE_ADDED,
        notificationTitle,
        new NotificationSourceEducationTerm(
          NotificationDomain.EDUCATION_TERM,
          educationId,
          newTerm.id,
        ),
        [inCharge],
        [],
      ),
    );
  }

  notifyReportAdded(
    term: EducationTermModel,
    requestManager: ChurchUserModel,
    newReceivers: ChurchUserModel[],
    notificationTitle: string,
    educationId: number,
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = newReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.EDUCATION_TERM_REPORT_ADDED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_TERM,
        NotificationAction.REPORT_ADDED,
        notificationTitle,
        new NotificationSourceEducationTerm(
          NotificationDomain.EDUCATION_TERM,
          educationId,
          term.id,
        ),
        notificationReceivers,
        [],
      ),
    );
  }

  notifyReportRemoved(
    term: EducationTermModel,
    requestManager: ChurchUserModel,
    removedReportReceivers: ChurchUserModel[],
    notificationTitle: string,
    educationId: number,
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = removedReportReceivers.filter(
      (r) => r.id !== requestManager.id,
    );

    this.eventEmitter.emit(
      NotificationEvent.EDUCATION_TERM_REPORT_REMOVED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_TERM,
        NotificationAction.REPORT_REMOVED,
        notificationTitle,
        new NotificationSourceEducationTerm(
          NotificationDomain.EDUCATION_TERM,
          educationId,
          term.id,
        ),
        notificationReceivers,
        [],
      ),
    );
  }

  notifyStatusUpdate(
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
    notificationTitle: string,
    notificationSource: NotificationSourceEducationTerm,
    previousStatus: EducationTermStatus,
    newStatus: EducationTermStatus,
  ) {
    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    const actorName = requestManager.member.name;

    this.eventEmitter.emit(
      NotificationEvent.EDUCATION_TERM_STATUS_UPDATED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_TERM,
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
    notificationSource: NotificationSourceEducationTerm,
  ) {
    const actorName = requestManager.member.name;

    // 이전 담당자 제외 알림
    if (oldInCharge && oldInCharge.id !== requestManager.id) {
      this.eventEmitter.emit(
        NotificationEvent.EDUCATION_TERM_IN_CHARGE_REMOVED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.EDUCATION_TERM,
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
        NotificationEvent.EDUCATION_TERM_IN_CHARGE_ADDED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.EDUCATION_TERM,
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

    notificationReceivers.length > 0 &&
      this.eventEmitter.emit(
        NotificationEvent.EDUCATION_TERM_IN_CHARGE_CHANGED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.EDUCATION_TERM,
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
    notificationSource: NotificationSourceEducationTerm,
    educationTerm: EducationTermModel,
    dto: UpdateEducationTermDto,
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    const notificationColumns = ['term', 'location', 'startDate', 'endDate'];

    const notificationFields: NotificationFields[] = [];

    for (const key of Object.keys(dto)) {
      if (!notificationColumns.includes(key)) {
        continue;
      }

      if (key === 'startDate' && dto.utcStartDate) {
        if (dto.utcStartDate.getTime() !== educationTerm.startDate.getTime()) {
          notificationFields.push(
            new NotificationFields(
              NotificationField.START_DATE,
              educationTerm.startDate,
              dto.utcStartDate,
            ),
          );
        }
      } else if (key === 'endDate' && dto.utcEndDate) {
        if (dto.utcEndDate.getTime() !== educationTerm.endDate.getTime()) {
          notificationFields.push(
            new NotificationFields(
              NotificationField.END_DATE,
              educationTerm.endDate,
              dto.utcEndDate,
            ),
          );
        }
      } else {
        if (dto[key] !== educationTerm[key]) {
          notificationFields.push(
            new NotificationFields(key, educationTerm[key], dto[key]),
          );
        }
      }
    }

    notificationFields.length > 0 &&
      this.eventEmitter.emit(
        NotificationEvent.EDUCATION_TERM_DATA_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.EDUCATION_TERM,
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
      NotificationEvent.EDUCATION_TERM_DELETED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_TERM,
        NotificationAction.DELETED,
        notificationTitle,
        null,
        notificationReceivers,
        [],
      ),
    );
  }

  async notifyEnrollmentUpdate(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    educationTerm: EducationTermModel,
    notificationTitle: string,
    notificationSource: NotificationSourceEducationTerm,
  ) {
    const [inCharge, reportReceivers] = await Promise.all([
      educationTerm.inChargeId
        ? this.managerDomainService.findManagerForNotification(
            church,
            educationTerm.inChargeId,
          )
        : null,
      this.managerDomainService.findManagersForNotification(
        church,
        educationTerm.reports.map((r) => r.receiverId),
      ),
    ]);

    const notificationReceivers = (
      inCharge ? [...reportReceivers, inCharge] : reportReceivers
    ).filter((t) => t.id !== requestManager.id);

    const actorName = requestManager.member.name;

    this.eventEmitter.emit(
      NotificationEvent.EDUCATION_TERM_ENROLLMENT_UPDATED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.EDUCATION_TERM,
        NotificationAction.UPDATED,
        notificationTitle,
        notificationSource,
        notificationReceivers,
        [new NotificationFields('enrollments', null, null)],
      ),
    );
  }
}
