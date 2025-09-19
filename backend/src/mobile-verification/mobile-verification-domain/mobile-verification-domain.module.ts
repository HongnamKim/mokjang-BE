import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileVerificationModel } from '../entity/mobile-verification.entity';
import { IMOBILE_VERIFICATION_DOMAIN_SERVICE } from './interface/mobile-verification-domain.service.interface';
import { MobileVerificationDomainService } from './service/mobile-verification-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([MobileVerificationModel])],
  providers: [
    {
      provide: IMOBILE_VERIFICATION_DOMAIN_SERVICE,
      useClass: MobileVerificationDomainService,
    },
  ],
  exports: [IMOBILE_VERIFICATION_DOMAIN_SERVICE],
})
export class MobileVerificationDomainModule {}
