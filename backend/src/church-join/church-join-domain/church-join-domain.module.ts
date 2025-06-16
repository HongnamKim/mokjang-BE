import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchJoinModel } from '../entity/church-join.entity';
import { ChurchJoinStatModel } from '../entity/church-join-stat.entity';
import { ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE } from './interface/church-join-requests-domain.service.interface';
import { ChurchJoinRequestsDomainService } from './service/church-join-requests-domain.service';
import { ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE } from './interface/church-join-request-stats-domain.service.interface';
import { ChurchJoinRequestStatsDomainService } from './service/church-join-request-stats-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChurchJoinModel, ChurchJoinStatModel])],
  providers: [
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
    ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE,
    ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE,
  ],
})
export class ChurchJoinDomainModule {}
