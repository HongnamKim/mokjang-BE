import { Module } from '@nestjs/common';
import { MobileVerificationService } from './service/mobile-verification.service';
import { MobileVerificationDomainModule } from './mobile-verification-domain/mobile-verification-domain.module';

@Module({
  imports: [MobileVerificationDomainModule],
  controllers: [],
  providers: [MobileVerificationService],
})
export class MobileVerificationModule {}
