import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupHistoryModel } from '../entity/group-history.entity';
import { IGROUP_HISTORY_DOMAIN_SERVICE } from './interface/group-history-domain.service.interface';
import { GroupHistoryDomainService } from './service/group-history-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupHistoryModel])],
  providers: [
    {
      provide: IGROUP_HISTORY_DOMAIN_SERVICE,
      useClass: GroupHistoryDomainService,
    },
  ],
  exports: [IGROUP_HISTORY_DOMAIN_SERVICE],
})
export class GroupHistoryDomainModule {}
