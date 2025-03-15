import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficerModel } from '../entity/officer.entity';
import { IOFFICERS_DOMAIN_SERVICE } from './interface/officers-domain.service.interface';
import { OfficersDomainService } from './officers-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([OfficerModel])],
  providers: [
    { provide: IOFFICERS_DOMAIN_SERVICE, useClass: OfficersDomainService },
  ],
  exports: [IOFFICERS_DOMAIN_SERVICE],
})
export class OfficersDomainModule {}
