import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from '../entity/church.entity';
import { ICHURCHES_DOMAIN_SERVICE } from './interface/churches-domain.service.interface';
import { ChurchesDomainService } from './service/churhes-domain.service';
import { ChurchJoinModel } from '../../church-join/entity/church-join.entity';
import { ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE } from '../../church-join/church-join-domain/interface/church-join-requests-domain.service.interface';
import { ChurchJoinRequestsDomainService } from '../../church-join/church-join-domain/service/church-join-requests-domain.service';
import { ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE } from '../../church-join/church-join-domain/interface/church-join-request-stats-domain.service.interface';
import { ChurchJoinRequestStatsDomainService } from '../../church-join/church-join-domain/service/church-join-request-stats-domain.service';
import { ChurchJoinStatModel } from '../../church-join/entity/church-join-stat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChurchModel,
      ChurchJoinModel,
      ChurchJoinStatModel,
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
