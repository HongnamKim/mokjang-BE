import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { toZonedTime } from 'date-fns-tz';
import { addDays, startOfDay } from 'date-fns';
import { WorshipModel } from '../entity/worship.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../../notification/const/notification-event.enum';
import {
  NotificationEventDto,
  NotificationSourceWorship,
} from '../../notification/notification-event.dto';
import { NotificationDomain } from '../../notification/const/notification-domain.enum';
import { NotificationAction } from '../../notification/const/notification-action.enum';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@Injectable()
export class WorshipNotificationService {
  constructor(
    private readonly eventEmitter: EventEmitter2,

    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
  ) {}

  private logger = new Logger('WorshipNotificationService');

  @Cron(CronExpression.EVERY_DAY_AT_10AM, { timeZone: TIME_ZONE.SEOUL })
  async notifyWorshipSessionCreated() {
    // 생성해야할 예배의 진행 요일
    const kstToday = toZonedTime(new Date(), TIME_ZONE.SEOUL);
    const serviceDate = startOfDay(addDays(kstToday, 1)); // 진행 날짜
    const targetWorshipDay = serviceDate.getDay(); // 진행 요일

    let cursor = 0;
    const bulkSize = 50;

    const actorName = '';

    while (true) {
      const targetWorships =
        await this.worshipDomainService.findBulkWorshipByDay(
          targetWorshipDay,
          bulkSize,
          cursor,
        );

      if (targetWorships.length === 0) break;

      const worshipChurchMap = this.convertMap(targetWorships);

      // 교회/매니저 일괄 조회
      const churchIds = Array.from(worshipChurchMap.keys());
      const managersMap = await this.fetchManagersMap(churchIds);

      for (const churchId of churchIds) {
        const worships = worshipChurchMap.get(churchId) ?? [];
        const managers = managersMap.get(churchId) ?? [];
        if (managers.length === 0) continue;

        for (const worship of worships) {
          // 알림 생성
          this.eventEmitter.emit(
            NotificationEvent.WORSHIP_SESSION_CREATED,
            new NotificationEventDto(
              actorName,
              NotificationDomain.WORSHIP,
              NotificationAction.CREATED,
              worship.title,
              new NotificationSourceWorship(
                NotificationDomain.WORSHIP,
                worship.id,
              ),
              managers,
              [],
            ),
          );
        }
      }

      if (targetWorships.length < bulkSize) {
        break;
      } else {
        cursor = targetWorships[targetWorships.length - 1].id;
      }

      this.logger.log('예배 생성 알림 생성 완료');
    }
  }

  private async fetchManagersMap(churchIds: number[]) {
    const managers =
      await this.managerDomainService.findAllManagerIdsBulk(churchIds);

    const map = new Map<number, ChurchUserModel[]>();
    for (const manager of managers) {
      const seen = map.get(manager.churchId);

      if (seen) {
        map.get(manager.churchId)!.push(manager);
      } else {
        map.set(manager.churchId, [manager]);
      }
    }
    return map;
  }

  private convertMap(targetWorships: WorshipModel[]) {
    const worshipChurchMap = new Map<number, WorshipModel[]>();

    for (const worship of targetWorships) {
      const seen = worshipChurchMap.get(worship.churchId);

      if (seen) {
        worshipChurchMap.get(worship.churchId)!.push(worship);
      } else {
        worshipChurchMap.set(worship.churchId, [worship]);
      }
    }

    return worshipChurchMap;
  }
}
