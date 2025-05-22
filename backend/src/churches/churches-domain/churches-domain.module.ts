import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from '../entity/church.entity';
import { ICHURCHES_DOMAIN_SERVICE } from './interface/churches-domain.service.interface';
import { ChurchesDomainService } from './service/churhes-domain.service';
import { ChurchJoinRequestModel } from '../entity/church-join-request.entity';
import { ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE } from './interface/church-join-requests-domain.service.interface';
import { ChurchJoinRequestsDomainService } from './service/church-join-requests-domain.service';
import { ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE } from './interface/church-join-request-stats-domain.service.interface';
import { ChurchJoinRequestStatsDomainService } from './service/church-join-request-stats-domain.service';
import { ChurchJoinRequestStatModel } from '../entity/church-join-request-stat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChurchModel,
      ChurchJoinRequestModel,
      ChurchJoinRequestStatModel,
    ]),
  ],
  providers: [
    { provide: ICHURCHES_DOMAIN_SERVICE, useClass: ChurchesDomainService },
    {
      provide: ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE,
      useClass: ChurchJoinRequestsDomainService,
    },
    {
      provide: ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE,
      useClass: ChurchJoinRequestStatsDomainService,
    },
  ],
  exports: [
    ICHURCHES_DOMAIN_SERVICE,
    ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE,
    ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE,
  ],
})
export class ChurchesDomainModule {}
