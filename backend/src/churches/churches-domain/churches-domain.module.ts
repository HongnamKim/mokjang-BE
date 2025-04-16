import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from '../entity/church.entity';
import { ICHURCHES_DOMAIN_SERVICE } from './interface/churches-domain.service.interface';
import { ChurchesDomainService } from './service/churhes-domain.service';
import { ChurchJoinRequestModel } from '../entity/church-join-request.entity';
import { ICHURCH_JOIN_REQUESTS_DOMAIN } from './interface/church-join-requests-domain.service.interface';
import { ChurchJoinRequestsDomainService } from './service/church-join-requests-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChurchModel, ChurchJoinRequestModel])],
  providers: [
    { provide: ICHURCHES_DOMAIN_SERVICE, useClass: ChurchesDomainService },
    {
      provide: ICHURCH_JOIN_REQUESTS_DOMAIN,
      useClass: ChurchJoinRequestsDomainService,
    },
  ],
  exports: [ICHURCHES_DOMAIN_SERVICE, ICHURCH_JOIN_REQUESTS_DOMAIN],
})
export class ChurchesDomainModule {}
