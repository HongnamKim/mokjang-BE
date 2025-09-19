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
import {
  NotificationEventDto,
  NotificationSourceWorship,
} from '../notification-event.dto';
import { NotificationDomain } from '../const/notification-domain.enum';
import { NotificationAction } from '../const/notification-action.enum';
import { toZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { format } from 'date-fns';

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

  async createDummyWorshipNotification(churchUser: ChurchUserModel) {
    const kstDate = toZonedTime(new Date(), TIME_ZONE.SEOUL);
    const kstStr = format(kstDate, 'MM-dd');

    const kstToday = kstDate.getDay();
    let domainTitle: string;
    switch (kstToday) {
      case 0:
        domainTitle = `주일예배 ${kstStr}`;
        break;
      case 1:
        domainTitle = `월요예배 ${kstStr}`;
        break;
      case 2:
        domainTitle = `화요예배 ${kstStr}`;
        break;
      case 3:
        domainTitle = `수요예배 ${kstStr}`;
        break;
      case 4:
        domainTitle = `목요예배 ${kstStr}`;
        break;
      case 5:
        domainTitle = `금요예배 ${kstStr}`;
        break;
      default:
        domainTitle = `토요예배 ${kstStr}`;
        break;
    }

    const event = new NotificationEventDto(
      '',
      NotificationDomain.WORSHIP,
      NotificationAction.CREATED,
      domainTitle,
      new NotificationSourceWorship(
        NotificationDomain.WORSHIP,
        Math.ceil(Math.random() * 5),
      ),
      [churchUser],
      [],
    );

    await this.notificationDomainService.createNotifications(event);
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

  @OnEvent(NotificationEvent.TASK_DATA_UPDATED, {
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

  @OnEvent(NotificationEvent.VISITATION_IN_CHARGE_CHANGED, {
    async: true,
    suppressErrors: true,
  })
  async handleVisitationInChargeChanged(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.VISITATION_IN_CHARGE_REMOVED, {
    async: true,
    suppressErrors: true,
  })
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

  @OnEvent(NotificationEvent.VISITATION_STATUS_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleVisitationStatusChanged(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.VISITATION_DATA_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleVisitationMetaUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_SESSION_IN_CHARGE_ADDED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationSessionInChargeAdded(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_SESSION_IN_CHARGE_REMOVED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationSessionInChargeRemoved(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_SESSION_IN_CHARGE_CHANGED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationSessionInChargeChanged(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_SESSION_REPORT_ADDED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationSessionReportAdded(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_SESSION_REPORT_REMOVED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationSessionReportRemoved(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_SESSION_STATUS_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationSessionStatusUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_SESSION_DATA_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationSessionDataUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_SESSION_DELETED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationSessionDeleted(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_TERM_IN_CHARGE_ADDED, {
    async: true,
    suppressErrors: true,
  })
  @OnEvent(NotificationEvent.EDUCATION_TERM_IN_CHARGE_REMOVED, {
    async: true,
    suppressErrors: true,
  })
  @OnEvent(NotificationEvent.EDUCATION_TERM_IN_CHARGE_CHANGED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationTermInChargeAdded(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  /*async handleEducationTermInChargeRemoved(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }*/

  /*async handleEducationTermInChargeChanged(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }*/

  @OnEvent(NotificationEvent.EDUCATION_TERM_REPORT_ADDED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationTermReportAdded(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_TERM_REPORT_REMOVED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationTermReportRemoved(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_TERM_STATUS_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationTermStatusUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_TERM_DATA_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  @OnEvent(NotificationEvent.EDUCATION_TERM_ENROLLMENT_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationTermDataUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.EDUCATION_TERM_DELETED, {
    async: true,
    suppressErrors: true,
  })
  async handleEducationTermDeleted(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.CHURCH_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleChurchUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.MANAGER_PERMISSION_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handleManagerPermissionUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.PERMISSION_TEMPLATE_UPDATED, {
    async: true,
    suppressErrors: true,
  })
  async handlePermissionTemplateUpdated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }

  @OnEvent(NotificationEvent.WORSHIP_SESSION_CREATED, {
    async: true,
    suppressErrors: true,
  })
  async handleWorshipSessionCreated(event: NotificationEventDto) {
    await this.notificationDomainService.createNotifications(event);
  }
}
