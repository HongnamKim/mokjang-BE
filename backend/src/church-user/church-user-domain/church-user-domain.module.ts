import { Module } from '@nestjs/common';
import { ICHURCH_USER_DOMAIN_SERVICE } from './service/interface/church-user-domain.service.interface';
import { ChurchUserDomainService } from './service/church-user-domain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchUserModel } from '../entity/church-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChurchUserModel])],
  providers: [
    {
      provide: ICHURCH_USER_DOMAIN_SERVICE,
      useClass: ChurchUserDomainService,
    },
  ],
  exports: [ICHURCH_USER_DOMAIN_SERVICE],
})
export class ChurchUserDomainModule {}
