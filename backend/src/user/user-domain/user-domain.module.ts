import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '../entity/user.entity';
import { UserDomainService } from './user-domain.service';
import { IUSER_DOMAIN_SERVICE } from './interface/user-domain.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel])],
  providers: [{ provide: IUSER_DOMAIN_SERVICE, useClass: UserDomainService }],
  exports: [IUSER_DOMAIN_SERVICE],
})
export class UserDomainModule {}
