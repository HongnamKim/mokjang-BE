import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModel } from '../entity/notification.entity';
import { INOTIFICATION_DOMAIN_SERVICE } from './interface/notification-domain.service.interface';
import { NotificationDomainService } from './service/notification-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationModel])],
  providers: [
    {
      provide: INOTIFICATION_DOMAIN_SERVICE,
      useClass: NotificationDomainService,
    },
  ],
  exports: [INOTIFICATION_DOMAIN_SERVICE],
})
export class NotificationDomainModule {}
