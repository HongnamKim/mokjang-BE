import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { NotificationController } from './controller/notification.controller';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { ChurchUserDomainModule } from '../church-user/church-user-domain/church-user-domain.module';
import { NotificationDomainModule } from './notification-domain/notification-domain.module';
import { NotificationService } from './service/notification.service';
import { DeviceController } from './controller/device.controller';
import { DeviceService } from './service/device.service';

@Module({
  imports: [
    RouterModule.register([
      { path: 'me/notification', module: NotificationModule },
    ]),
    UserDomainModule,
    ChurchesDomainModule,
    ChurchUserDomainModule,
    NotificationDomainModule,
  ],
  controllers: [DeviceController, NotificationController],
  providers: [DeviceService, NotificationService],
})
export class NotificationModule {}
