import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModel } from '../../members/entity/member.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ManagerDomainService } from './service/manager-domain.service';
import { IMANAGER_DOMAIN_SERVICE } from './service/interface/manager-domain.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([MemberModel, ChurchUserModel])],
  providers: [
    {
      provide: IMANAGER_DOMAIN_SERVICE,
      useClass: ManagerDomainService,
    },
  ],
  exports: [IMANAGER_DOMAIN_SERVICE],
})
export class ManagerDomainModule {}
