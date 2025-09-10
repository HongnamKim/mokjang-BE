import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { NotificationEvent } from '../../notification/const/notification-event.enum';
import {
  NotificationEventDto,
  NotificationFields,
} from '../../notification/notification-event.dto';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';
import { NotificationAction } from '../../notification/const/notification-action.enum';
import { UpdateChurchDto } from '../dto/update-church.dto';
import { ChurchModel } from '../entity/church.entity';

@Injectable()
export class ChurchesNotificationService {
  constructor(private eventEmitter: EventEmitter2) {}

  notifyChurchUpdate(
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
    church: ChurchModel,
    dto: UpdateChurchDto,
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    const notificationFields: NotificationFields[] = [];

    for (const key of Object.keys(dto)) {
      if (dto[key] !== church[key]) {
        notificationFields.push(
          new NotificationFields(key, dto[key], church[key]),
        );
      }
    }

    this.eventEmitter.emit(
      NotificationEvent.CHURCH_UPDATED,
      new NotificationEventDto(
        actorName,
        NotificationDomain.CHURCH_INFO,
        NotificationAction.UPDATED,
        church.name,
        null,
        notificationReceivers,
        notificationFields,
      ),
    );
  }
}
