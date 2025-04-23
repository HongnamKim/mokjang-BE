import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinistryModel } from '../entity/ministry.entity';
import { MinistryGroupModel } from '../entity/ministry-group.entity';
import { IMINISTRIES_DOMAIN_SERVICE } from './interface/ministries-domain.service.interface';
import { MinistriesDomainService } from './service/ministries-domain.service';
import { IMINISTRY_GROUPS_DOMAIN_SERVICE } from './interface/ministry-groups-domain.service.interface';
import { MinistryGroupsDomainService } from './service/ministry-groups-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinistryModel, MinistryGroupModel])],
  providers: [
    {
      provide: IMINISTRIES_DOMAIN_SERVICE,
      useClass: MinistriesDomainService,
    },
    {
      provide: IMINISTRY_GROUPS_DOMAIN_SERVICE,
      useClass: MinistryGroupsDomainService,
    },
  ],
  exports: [IMINISTRIES_DOMAIN_SERVICE, IMINISTRY_GROUPS_DOMAIN_SERVICE],
})
export class MinistriesDomainModule {}
