import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from '../entity/church.entity';
import { ICHURCHES_DOMAIN_SERVICE } from './interface/churches-domain.service.interface';
import { ChurchesDomainService } from './churhes-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChurchModel])],
  providers: [
    { provide: ICHURCHES_DOMAIN_SERVICE, useClass: ChurchesDomainService },
  ],
  exports: [ICHURCHES_DOMAIN_SERVICE],
})
export class ChurchesDomainModule {}
