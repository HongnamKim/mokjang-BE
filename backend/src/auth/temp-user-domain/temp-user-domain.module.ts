import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TempUserModel } from '../entity/temp-user.entity';
import { ITEMP_USER_DOMAIN_SERVICE } from './service/interface/temp-user.service.interface';
import { TempUserDomainService } from './service/temp-user-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([TempUserModel])],
  providers: [
    { provide: ITEMP_USER_DOMAIN_SERVICE, useClass: TempUserDomainService },
  ],
  exports: [ITEMP_USER_DOMAIN_SERVICE],
})
export class TempUserDomainModule {}
