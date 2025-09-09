import { Injectable, NotFoundException } from '@nestjs/common';
import { INotificationDomainService } from '../interface/notification-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationModel } from '../../entity/notification.entity';
import {
  FindOptionsRelations,
  LessThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { addWeeks, subMonths } from 'date-fns';
import { GetNotificationsDto } from '../../dto/request/get-notifications.dto';
import { DomainCursorPaginationResultDto } from '../../../common/dto/domain-cursor-pagination-result.dto';
import {
  NotificationEventDto,
  NotificationField,
  NotificationFields,
} from '../../notification-event.dto';

@Injectable()
export class NotificationDomainService implements INotificationDomainService {
  constructor(
    @InjectRepository(NotificationModel)
    private readonly repository: Repository<NotificationModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(NotificationModel) : this.repository;
  }

  async findNotificationList(
    churchUser: ChurchUserModel,
    dto: GetNotificationsDto,
  ): Promise<DomainCursorPaginationResultDto<NotificationModel>> {
    const repository = this.getRepository();

    const query = repository
      .createQueryBuilder('notification')
      .leftJoin('notification.churchUser', 'churchUser')
      .where('churchUser.id = :churchUserId', { churchUserId: churchUser.id })
      .orderBy('notification.isRead', 'ASC')
      .addOrderBy('notification.id', 'DESC');

    if (dto.cursor) {
      const decodedCursor = this.decodeCursor(dto.cursor);

      const { id, value } = decodedCursor;

      query.andWhere(
        `(notification.isRead = :value AND notification.id < :notificationId) OR (notification.isRead = true AND :value = false)`,
        {
          value,
          notificationId: id,
        },
      );
    }

    const items = await query.limit(dto.limit + 1).getMany();

    const hasMore = items.length > dto.limit;
    if (hasMore) {
      items.pop();
    }

    const nextCursor =
      hasMore && items.length > 0
        ? this.encodeCursor(items[items.length - 1])
        : undefined;

    return { items, nextCursor, hasMore };
  }

  private encodeCursor(notification: NotificationModel) {
    const cursorData = {
      id: notification.id,
      value: notification.isRead,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  private decodeCursor(cursor: string) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  async findNotificationModelById(
    churchUser: ChurchUserModel,
    notificationId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<NotificationModel>,
  ): Promise<NotificationModel> {
    const repository = this.getRepository(qr);

    const noti = await repository.findOne({
      where: {
        id: notificationId,
        churchUserId: churchUser.id,
      },
      relations: relationOptions,
    });

    if (!noti) {
      throw new NotFoundException('해당 알림을 찾을 수 없습니다.');
    }

    return noti;
  }

  countUnreadNotifications(
    churchUser: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<number> {
    const repository = this.getRepository(qr);

    return repository.count({
      where: {
        churchUserId: churchUser.id,
        isRead: false,
      },
    });
  }

  createDummyNotification(
    churchUser: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<NotificationModel> {
    const repository = this.getRepository(qr);

    const now = new Date();

    return repository.save({
      churchUserId: churchUser.id,
      payload: [
        new NotificationFields(
          NotificationField.TITLE,
          '테스트 제목',
          '제목 수정',
        ),
      ],

      expiresAt: addWeeks(now, 2),
    });
  }

  private uniqBy<T>(arr: T[], key: keyof T): T[] {
    const seen = new Set<any>();

    return arr.filter((item) => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }

  createNotifications(
    event: NotificationEventDto,
  ): Promise<NotificationModel[]> {
    const repository = this.getRepository();

    const receivers = event.notificationReceivers;

    const uniqueReceivers = this.uniqBy(receivers, 'id');

    //console.log(uniqueReceivers);

    const now = new Date();

    const notifications = repository.create(
      uniqueReceivers.map((receiver) => ({
        churchUserId: receiver.id,
        actorName: event.actorName,
        domain: event.domain,
        action: event.action,
        domainTitle: event.title,
        payload: event.fields,
        sourceInfo: event.source,
        expiresAt: addWeeks(now, 2),
      })),
    );

    return repository.save(notifications, { chunk: 10 });
  }

  async checkRead(notification: NotificationModel, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    return repository.update(
      {
        id: notification.id,
      },
      {
        isRead: true,
      },
    );
  }

  checkReadAll(
    churchUser: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    return repository.update(
      {
        churchUserId: churchUser.id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );
  }

  async cleanUp() {
    const repository = this.getRepository();

    const expireDate = subMonths(new Date(), 1);

    return repository.delete({
      createdAt: LessThanOrEqual(expireDate),
    });
  }
}
