import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestInfoModel } from '../entity/request-info.entity';
import { IREQUEST_INFO_DOMAIN_SERVICE } from './interface/request-info-domain.service.interface';
import { RequestInfoDomainService } from './service/request-info-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestInfoModel])],
  providers: [
    {
      provide: IREQUEST_INFO_DOMAIN_SERVICE,
      useClass: RequestInfoDomainService,
    },
  ],
  exports: [IREQUEST_INFO_DOMAIN_SERVICE],
})
export class RequestInfoDomainModule {}
