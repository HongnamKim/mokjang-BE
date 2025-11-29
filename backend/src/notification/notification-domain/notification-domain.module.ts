import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModel } from '../entity/notification.entity';
import { INOTIFICATION_DOMAIN_SERVICE } from './interface/notification-domain.service.interface';
import { NotificationDomainService } from './service/notification-domain.service';
import { DeviceModel } from '../entity/device.entity';
import { IDEVICE_DOMAIN_SERVICE } from './interface/device-domain.service.interface';
import { DeviceDomainService } from './service/device-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationModel, DeviceModel])],
  providers: [
    {
      provide: INOTIFICATION_DOMAIN_SERVICE,
      useClass: NotificationDomainService,
    },
    {
      provide: IDEVICE_DOMAIN_SERVICE,
      useClass: DeviceDomainService,
    },
  ],
  exports: [INOTIFICATION_DOMAIN_SERVICE, IDEVICE_DOMAIN_SERVICE],
})
export class NotificationDomainModule {}
