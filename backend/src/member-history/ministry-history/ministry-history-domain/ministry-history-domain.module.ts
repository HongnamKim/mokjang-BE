import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinistryHistoryModel } from '../entity/child/ministry-history.entity';
import { MinistryGroupHistoryModel } from '../entity/ministry-group-history.entity';
import { MinistryGroupRoleHistoryModel } from '../entity/child/ministry-group-role-history.entity';
import { IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE } from './interface/ministry-group-history-domain.service.interface';
import { MinistryGroupHistoryDomainService } from './service/ministry-group-history-domain.service';
import { IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE } from './interface/ministry-group-detail-history-domain.service.interface';
import { MinistryGroupDetailHistoryDomainService } from './service/ministry-group-detail-history-domain.service';
import { MinistryGroupDetailHistoryModel } from '../entity/ministry-group-detail-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MinistryGroupHistoryModel,
      MinistryGroupDetailHistoryModel,

      // child entity
      MinistryHistoryModel,
      MinistryGroupRoleHistoryModel,
    ]),
  ],
  providers: [
    {
      provide: IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
      useClass: MinistryGroupHistoryDomainService,
    },
    {
      provide: IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
      useClass: MinistryGroupDetailHistoryDomainService,
    },
  ],
  exports: [
    IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
    IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
  ],
})
export class MinistryHistoryDomainModule {}
