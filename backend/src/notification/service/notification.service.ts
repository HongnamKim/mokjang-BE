import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  INOTIFICATION_DOMAIN_SERVICE,
  INotificationDomainService,
} from '../notification-domain/interface/notification-domain.service.interface';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { GetUnreadCountResponseDto } from '../dto/response/get-unread-count-response.dto';
import { GetNotificationsDto } from '../dto/request/get-notifications.dto';
import { GetNotificationListResponseDto } from '../dto/response/get-notification-list-response.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationEvent } from '../const/notification-event.enum';
import { NotificationEventDto } from '../notification-event.dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(INOTIFICATION_DOMAIN_SERVICE)
    private readonly notificationDomainService: INotificationDomainService,
  ) {}

  private readonly logger = new Logger(NotificationService.name);

  async getNotifications(
    churchUser: ChurchUserModel,
    dto: GetNotificationsDto,
  ) {
    const result = await this.notificationDomainService.findNotificationList(
      churchUser,
      dto,
    );

    return new GetNotificationListResponseDto(
      result.items,
      result.items.length,
      result.nextCursor,
      result.hasMore,
    );
  }

  async createDummyNotification(churchUser: ChurchUserModel) {
    return this.notificationDomainService.createDummyNotification(churchUser);
  }

  async getUnreadCount(churchUser: ChurchUserModel) {
    const unreadCount =
      await this.notificationDomainService.countUnreadNotifications(churchUser);

    return new GetUnreadCountResponseDto(unreadCount);
  }

  async checkReadAll(churchUser: ChurchUserModel) {
    await this.notificationDomainService.checkReadAll(churchUser);

    return {
      success: true,
      timestamp: new Date(),
    };
  }

  async checkRead(churchUser: ChurchUserModel, notificationId: number) {
    const targetNotification =
      await this.notificationDomainService.findNotificationModelById(
        churchUser,
        notificationId,
      );

    await this.notificationDomainService.checkRead(targetNotification);

    return {
      success: true,
      timestamp: new Date(),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })
  async cleanUp() {
    const result = await this.notificationDomainService.cleanUp();

    this.logger.log(`${result.affected} 개 알림 삭제`);
  }

  @OnEvent(NotificationEvent.TASK_IN_CHARGE_ADDED, {
    async: true,
    suppressErrors: true,
  })
  async handleTaskInChargeAdded(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.TASK_IN_CHARGE_REMOVED, {
    async: true,
    suppressErrors: true,
  })
  async handleTaskInChargeRemoved(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.TASK_IN_CHARGE_CHANGED, {
    async: true,
    suppressErrors: true,
  })
  async handleTaskInChargeChanged(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.TASK_REPORT_ADDED, {
    async: true,
    suppressErrors: true,
  })
  async handleTaskReportAdded(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.TASK_REPORT_REMOVED, {
    async: true,
    suppressErrors: true,
  })
  async handleTaskReportRemoved(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.TASK_STATUS_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleTaskStatusChanged(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.TASK_META_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleTaskMetaUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.TASK_DELETED, {
    async: true,
    suppressErrors: true,
  })
  async handleTaskDeleted(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.VISITATION_IN_CHARGE_ADDED, {
    async: true,
    suppressErrors: true,
  })
  async handleVisitationInChargeAdded(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }
  @OnEvent(NotificationEvent.VISITATION_IN_CHARGE_CHANGED)
  async handleVisitationInChargeChanged(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.VISITATION_IN_CHARGE_REMOVED)
  async handleVisitationInChargeRemoved(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.VISITATION_REPORT_ADDED, {
    async: true,
    suppressErrors: true,
  })
  async handleVisitationReportAdded(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.VISITATION_REPORT_REMOVED, {
    async: true,
    suppressErrors: true,
  })
  async handleVisitationReportRemoved(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.VISITATION_DELETED, {
    async: true,
    suppressErrors: true,
  })
  async handleVisitationDeleted(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.VISITATION_STATUS_UPDATED, {})
  async handleVisitationStatusStatusChanged(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.VISITATION_META_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleVisitationMetaUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }
}
