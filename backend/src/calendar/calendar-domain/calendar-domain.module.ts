import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchEventModel } from '../entity/church-event.entity';
import { ICHURCH_EVENT_DOMAIN_SERVICE } from './interface/church-event-domain.service.interface';
import { ChurchEventDomainService } from './service/church-event-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChurchEventModel])],
  providers: [
    {
      provide: ICHURCH_EVENT_DOMAIN_SERVICE,
      useClass: ChurchEventDomainService,
    },
  ],
  exports: [ICHURCH_EVENT_DOMAIN_SERVICE],
})
export class CalendarDomainModule {}
