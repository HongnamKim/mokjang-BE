import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinistryHistoryModel } from '../entity/ministry-history.entity';
import { MinistryGroupHistoryModel } from '../entity/ministry-group-history.entity';
import { MinistryGroupRoleHistoryModel } from '../entity/ministry-group-role-history.entity';
import { IMINISTRY_HISTORY_DOMAIN_SERVICE } from './interface/ministry-history-domain.service.interface';
import { MinistryHistoryDomainService } from './service/ministry-history-domain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MinistryHistoryModel,
      MinistryGroupHistoryModel,
      MinistryGroupRoleHistoryModel,
    ]),
  ],
  providers: [
    {
      provide: IMINISTRY_HISTORY_DOMAIN_SERVICE,
      useClass: MinistryHistoryDomainService,
    },
  ],
  exports: [IMINISTRY_HISTORY_DOMAIN_SERVICE],
})
export class MinistryHistoryDomainModule {}
