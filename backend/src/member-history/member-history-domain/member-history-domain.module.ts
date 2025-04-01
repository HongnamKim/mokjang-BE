import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IOFFICER_HISTORY_DOMAIN_SERVICE } from './service/interface/officer-history-domain.service.interface';
import { OfficerHistoryDomainService } from './service/officer-history-domain.service';
import { OfficerHistoryModel } from '../entity/officer-history.entity';
import { IMINISTRY_HISTORY_DOMAIN_SERVICE } from './service/interface/ministry-history-domain.service.interface';
import { MinistryHistoryDomainService } from './service/ministry-history-domain.service';
import { MinistryHistoryModel } from '../entity/ministry-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OfficerHistoryModel, MinistryHistoryModel]),
  ],
  providers: [
    {
      provide: IOFFICER_HISTORY_DOMAIN_SERVICE,
      useClass: OfficerHistoryDomainService,
    },
    {
      provide: IMINISTRY_HISTORY_DOMAIN_SERVICE,
      useClass: MinistryHistoryDomainService,
    },
  ],
  exports: [IOFFICER_HISTORY_DOMAIN_SERVICE, IMINISTRY_HISTORY_DOMAIN_SERVICE],
})
export class MemberHistoryDomainModule {}
