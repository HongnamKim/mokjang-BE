import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficerHistoryModel } from '../entity/officer-history.entity';
import { IOFFICER_HISTORY_DOMAIN_SERVICE } from './interface/officer-history-domain.service.interface';
import { OfficerHistoryDomainService } from './service/officer-history-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([OfficerHistoryModel])],
  providers: [
    {
      provide: IOFFICER_HISTORY_DOMAIN_SERVICE,
      useClass: OfficerHistoryDomainService,
    },
  ],
  exports: [IOFFICER_HISTORY_DOMAIN_SERVICE],
})
export class OfficerHistoryDomainModule {}
