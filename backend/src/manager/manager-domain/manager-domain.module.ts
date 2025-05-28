import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModel } from '../../members/entity/member.entity';
import { IMANAGER_DOMAIN_SERVICE } from './service/interface/manager-domain.service.interface';
import { ManagerDomainService } from './service/manager-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberModel])],
  providers: [
    {
      provide: IMANAGER_DOMAIN_SERVICE,
      useClass: ManagerDomainService,
    },
  ],
  exports: [IMANAGER_DOMAIN_SERVICE],
})
export class ManagerDomainModule {}
