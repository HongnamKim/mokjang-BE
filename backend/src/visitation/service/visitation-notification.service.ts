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
  NotificationSourceVisitation,
} from '../../notification/notification-event.dto';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';
import { NotificationAction } from '../../notification/const/notification-action.enum';

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
