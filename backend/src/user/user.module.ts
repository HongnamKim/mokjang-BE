import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { UserDomainModule } from './user-domain/user-domain.module';
import { ChurchesDomainModule } from '../churches/churches-domain/churches-domain.module';
import { ChurchUserDomainModule } from '../church-user/church-user-domain/church-user-domain.module';
import { MobileVerificationDomainModule } from '../mobile-verification/mobile-verification-domain/mobile-verification-domain.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    CommonModule,
    UserDomainModule,
    ChurchesDomainModule,
    ChurchUserDomainModule,
    MobileVerificationDomainModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class UserModule {}
