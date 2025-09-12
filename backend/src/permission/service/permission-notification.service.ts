import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { NotificationEvent } from '../../notification/const/notification-event.enum';
import {
  NotificationEventDto,
  NotificationFields,
  NotificationSourcePermissionTemplate,
} from '../../notification/notification-event.dto';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';
import { NotificationAction } from '../../notification/const/notification-action.enum';
import { PermissionTemplateModel } from '../entity/permission-template.entity';
import { UpdatePermissionTemplateDto } from '../dto/template/request/update-permission-template.dto';

@Injectable()
export class PermissionNotificationService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  isDifferent(a: number[], b: number[]) {
    if (a.length !== b.length) {
      return true;
    }

    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);

    return !sortedA.every((val, idx) => val === sortedB[idx]);
  }

  notifyPermissionTemplateUpdated(
    requestManager: ChurchUserModel,
    notificationTargets: ChurchUserModel[],
    owner: ChurchUserModel | null,
    permissionTemplate: PermissionTemplateModel,
    dto: UpdatePermissionTemplateDto,
  ) {
    const actorName = requestManager.member.name;

    const notificationReceivers = notificationTargets.filter(
      (t) => t.id !== requestManager.id,
    );

    const notificationFields: NotificationFields[] = [];

    // 제목 변경 시
    if (dto.title && dto.title !== permissionTemplate.title) {
      notificationFields.push(
        new NotificationFields('title', permissionTemplate.title, dto.title),
      );
    }
    // 설명 변경
    if (dto.description && dto.description !== permissionTemplate.description) {
      notificationFields.push(
        new NotificationFields(
          'description',
          permissionTemplate.description,
          dto.description,
        ),
      );
    }
    // 권한 유닛 변경
    if (dto.unitIds) {
      const unitIds = permissionTemplate.permissionUnits.map((u) => u.id);
      if (this.isDifferent(unitIds, dto.unitIds)) {
        notificationFields.push(
          new NotificationFields('permissionUnits', null, null),
        );
      }
    }

    // 변경 사항 없음 --> 알림 X
    if (notificationFields.length === 0) {
      return;
    }

    notificationReceivers.length > 0 &&
      this.eventEmitter.emit(
        NotificationEvent.PERMISSION_TEMPLATE_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.PERMISSION,
          NotificationAction.UPDATED,
          '',
          null,
          notificationReceivers,
          notificationFields,
        ),
      );

    owner &&
      owner.id !== requestManager.id &&
      this.eventEmitter.emit(
        NotificationEvent.PERMISSION_TEMPLATE_UPDATED,
        new NotificationEventDto(
          actorName,
          NotificationDomain.PERMISSION,
          NotificationAction.UPDATED,
          permissionTemplate.title,
          new NotificationSourcePermissionTemplate(
            NotificationDomain.PERMISSION,
            permissionTemplate.id,
          ),
          [owner],
          notificationFields,
        ),
      );
  }
}
