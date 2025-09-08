import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { QueryRunner } from 'typeorm';
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
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
  ) {}

  private async getReportReceivers(
    church: ChurchModel,
    visitation: VisitationMetaModel,
    qr: QueryRunner,
  ) {
    const reportReceiverIds = visitation.reports.map((r) => r.receiverId);

    return this.managerDomainService.findManagersForNotification(
      church,
      reportReceiverIds,
      qr,
    );
  }

  notifyPost(
    newVisitation: VisitationMetaModel,
    creatorManager: ChurchUserModel,
    inCharge: ChurchUserModel,
  ) {
    const actorName = creatorManager.member.name
      ? creatorManager.member.name
      : '';

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
    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';

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
        newReceivers,
        [],
      ),
    );
  }

  notifyReportRemoved(
    visitation: VisitationMetaModel,
    requestManager: ChurchUserModel,
    removedReportReceivers: ChurchUserModel[],
  ) {
    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';

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
        removedReportReceivers,
        [],
      ),
    );
  }

  async notifyStatusUpdate(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    targetVisitation: VisitationMetaModel,
    newStatus: VisitationStatus,
    qr: QueryRunner,
  ) {
    const reportReceivers = await this.getReportReceivers(
      church,
      targetVisitation,
      qr,
    );

    const inCharge = targetVisitation.inChargeId
      ? await this.managerDomainService.findManagerForNotification(
          church,
          targetVisitation.inChargeId,
          qr,
        )
      : null;

    const notificationTargets = (
      inCharge ? [...reportReceivers, inCharge] : reportReceivers
    ).filter((t) => t.id !== requestManager.id);

    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_STATUS_UPDATED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
        NotificationAction.STATUS_UPDATED,
        targetVisitation.title,
        new NotificationSourceVisitation(
          NotificationDomain.VISITATION,
          targetVisitation.id,
        ),
        notificationTargets,
        [
          new NotificationFields(
            NotificationField.STATUS,
            targetVisitation.status,
            newStatus,
          ),
        ],
      ),
    );
  }

  async notifyInChargeUpdate(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    targetVisitation: VisitationMetaModel,
    newInChargeMember: ChurchUserModel,
    qr: QueryRunner,
  ) {
    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';

    const previousInCharge = targetVisitation.inChargeId
      ? await this.managerDomainService.findManagerForNotification(
          church,
          targetVisitation.inChargeId,
          qr,
        )
      : null;

    const notificationSource = new NotificationSourceVisitation(
      NotificationDomain.VISITATION,
      targetVisitation.id,
    );

    // 이전 담당자 제외 알림
    if (previousInCharge && previousInCharge.id !== requestManager.id) {
      this.eventEmitter.emit(
        NotificationEvent.VISITATION_IN_CHARGE_REMOVED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.VISITATION,
          NotificationAction.IN_CHARGE_REMOVED,
          targetVisitation.title,
          notificationSource,
          [previousInCharge],
          [],
        ),
      );
    }

    // 새 담당자 지정 알림
    if (newInChargeMember.id !== requestManager.id) {
      this.eventEmitter.emit(
        NotificationEvent.VISITATION_IN_CHARGE_ADDED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.VISITATION,
          NotificationAction.IN_CHARGE_ADDED,
          targetVisitation.title,
          notificationSource,
          [newInChargeMember],
          [],
        ),
      );
    }

    const reportReceivers = (
      await this.getReportReceivers(church, targetVisitation, qr)
    ).filter((r) => r.id !== requestManager.id);

    // 담당자 변경 알림
    this.eventEmitter.emit(
      NotificationEvent.VISITATION_IN_CHARGE_CHANGED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
        NotificationAction.IN_CHARGE_CHANGED,
        targetVisitation.title,
        notificationSource,
        reportReceivers,
        [
          new NotificationFields(
            NotificationField.IN_CHARGE,
            previousInCharge?.member.name,
            newInChargeMember.member.name,
          ),
        ],
      ),
    );
  }

  async notifyMemberUpdate(
    church: ChurchModel,
    targetVisitation: VisitationMetaModel,
    requestManager: ChurchUserModel,
    qr: QueryRunner,
  ) {
    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';

    const inCharge = targetVisitation.inChargeId
      ? await this.managerDomainService.findManagerForNotification(
          church,
          targetVisitation.inChargeId,
          qr,
        )
      : null;

    const reportReceivers = await this.getReportReceivers(
      church,
      targetVisitation,
      qr,
    );

    const notificationReceivers = (
      inCharge ? [...reportReceivers, inCharge] : reportReceivers
    ).filter((r) => r.id !== requestManager.id);

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_META_UPDATED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
        NotificationAction.UPDATED,
        targetVisitation.title,
        new NotificationSourceVisitation(
          NotificationDomain.VISITATION,
          targetVisitation.id,
        ),
        notificationReceivers,
        [new NotificationFields('members', null, null)],
      ),
    );
  }

  async notifyDataUpdate(
    church: ChurchModel,
    targetVisitation: VisitationMetaModel,
    requestManager: ChurchUserModel,
    dto: UpdateVisitationDto,
    qr: QueryRunner,
  ) {
    const reportReceivers = await this.getReportReceivers(
      church,
      targetVisitation,
      qr,
    );
    const inCharge = targetVisitation.inChargeId
      ? await this.managerDomainService.findManagerForNotification(
          church,
          targetVisitation.inChargeId,
          qr,
        )
      : null;

    // 알림 수신 대상자
    const notificationTargets = (
      inCharge ? [...reportReceivers, inCharge] : reportReceivers
    ).filter((r) => r.id !== requestManager.id);

    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';

    const title = targetVisitation.title;
    const notificationSource = new NotificationSourceVisitation(
      NotificationDomain.VISITATION,
      targetVisitation.id,
    );

    const notificationFields: NotificationFields[] = [];

    const notificationColumns = [
      'title',
      'startDate',
      'endDate',
      'visitationMethod',
    ];

    // 업데이트 사항 체크
    for (const key of Object.keys(dto)) {
      if (!notificationColumns.includes(key)) {
        continue;
      }

      // 제목 변경
      /*if (key === 'title' && dto.title !== title) {
        notificationFields.push(
          new NotificationFields('title', title, dto.title),
        );
      } else*/ if (key === 'startDate' && dto.startDate) {
        const utcStartDate = fromZonedTime(dto.startDate, TIME_ZONE.SEOUL);
        if (utcStartDate !== targetVisitation.startDate) {
          notificationFields.push(
            new NotificationFields(
              'startDate',
              targetVisitation.startDate,
              utcStartDate,
            ),
          );
        }
      } else if (key === 'endDate' && dto.endDate) {
        const utcEndDate = fromZonedTime(dto.endDate, TIME_ZONE.SEOUL);
        if (utcEndDate !== targetVisitation.startDate) {
          notificationFields.push(
            new NotificationFields(
              'endDate',
              targetVisitation.endDate,
              utcEndDate,
            ),
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
        NotificationEvent.VISITATION_META_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.VISITATION,
          NotificationAction.UPDATED,
          title,
          notificationSource,
          notificationTargets,
          notificationFields,
        ),
      );
  }

  async notifyDelete(
    church: ChurchModel,
    targetVisitation: VisitationMetaModel,
    requestManager: ChurchUserModel,
    qr: QueryRunner,
  ) {
    const actorName = requestManager.member.name
      ? requestManager.member.name
      : '';

    const receiverIds = targetVisitation.reports.map((r) => r.receiverId);

    const notificationReceiverIds = [
      targetVisitation.inChargeId,
      ...receiverIds,
    ].filter((id) => id !== null);

    const notificationReceivers =
      await this.managerDomainService.findManagersForNotification(
        church,
        notificationReceiverIds,
        qr,
      );

    this.eventEmitter.emit(
      NotificationEvent.VISITATION_DELETED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.VISITATION,
        NotificationAction.DELETED,
        targetVisitation.title,
        null,
        notificationReceivers,
        [],
      ),
    );
  }
}
