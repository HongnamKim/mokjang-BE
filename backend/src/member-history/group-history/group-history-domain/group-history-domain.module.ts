import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupHistoryModel } from '../entity/group-history.entity';
import { IGROUP_HISTORY_DOMAIN_SERVICE } from './interface/group-history-domain.service.interface';
import { GroupHistoryDomainService } from './service/group-history-domain.service';
import { GroupDetailHistoryModel } from '../entity/group-detail-history.entity';
import { IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE } from './interface/group-detail-history-domain.service.interface';
import { GroupDetailHistoryDomainService } from './service/group-detail-history-domain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupHistoryModel, GroupDetailHistoryModel]),
  ],
  providers: [
    {
      provide: IGROUP_HISTORY_DOMAIN_SERVICE,
      useClass: GroupHistoryDomainService,
    },
    {
      provide: IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
      useClass: GroupDetailHistoryDomainService,
    },
  ],
  exports: [
    IGROUP_HISTORY_DOMAIN_SERVICE,
    IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
  ],
})
export class GroupHistoryDomainModule {}
