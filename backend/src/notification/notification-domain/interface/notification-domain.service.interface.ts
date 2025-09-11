import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import {
  DeleteResult,
  FindOptionsRelations,
  QueryRunner,
  UpdateResult,
} from 'typeorm';
import { NotificationModel } from '../../entity/notification.entity';
import { GetNotificationsDto } from '../../dto/request/get-notifications.dto';
import { DomainCursorPaginationResultDto } from '../../../common/dto/domain-cursor-pagination-result.dto';
import { NotificationEventDto } from '../../notification-event.dto';

export const INOTIFICATION_DOMAIN_SERVICE = Symbol(
  'INOTIFICATION_DOMAIN_SERVICE',
);

export interface INotificationDomainService {
  findNotificationList(
    churchUser: ChurchUserModel,
    dto: GetNotificationsDto,
  ): Promise<DomainCursorPaginationResultDto<NotificationModel>>;

  findNotificationModelById(
    churchUser: ChurchUserModel,
    notificationId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<NotificationModel>,
  ): Promise<NotificationModel>;

  countUnreadNotifications(
    churchUser: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<number>;

  createDummyNotification(
    churchUser: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<NotificationModel>;

  createNotifications(event: NotificationEventDto): Promise<any[]>;

  checkRead(
    notification: NotificationModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  checkReadAll(
    churchUser: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  cleanUp(): Promise<DeleteResult>;
}
