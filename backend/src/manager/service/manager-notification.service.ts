import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { NotificationEvent } from '../../notification/const/notification-event.enum';
import {
  NotificationEventDto,
  NotificationSourceManager,
} from '../../notification/notification-event.dto';
import { NotificationAction } from '../../notification/const/notification-action.enum';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';

@Injectable()
export class ManagerNotificationService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  notifyPermissionUpdated(
    requestManager: ChurchUserModel,
    targetManager: ChurchUserModel,
    ownerManager: ChurchUserModel | null,
  ) {
    const actorName = requestManager.member.name;

    // 당사자에게 알림
    requestManager.id !== targetManager.id &&
      this.eventEmitter.emit(
        NotificationEvent.MANAGER_PERMISSION_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.MANAGER,
          NotificationAction.UPDATED,
          '',
          null,
          [targetManager],
          [],
        ),
      );

    // 소유자에게 알림
    ownerManager &&
      ownerManager.id !== requestManager.id &&
      this.eventEmitter.emit(
        NotificationEvent.MANAGER_PERMISSION_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.MANAGER,
          NotificationAction.UPDATED,
          targetManager.member.name,
          new NotificationSourceManager(
            NotificationDomain.MANAGER,
            targetManager.id,
          ),
          [ownerManager],
          [],
        ),
      );
  }
}
