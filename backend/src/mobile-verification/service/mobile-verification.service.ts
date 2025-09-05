import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IMOBILE_VERIFICATION_DOMAIN_SERVICE,
  IMobileVerificationDomainService,
} from '../mobile-verification-domain/interface/mobile-verification-domain.service.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TIME_ZONE } from '../../common/const/time-zone.const';

@Injectable()
export class MobileVerificationService {
  constructor(
    @Inject(IMOBILE_VERIFICATION_DOMAIN_SERVICE)
    private readonly mobileVerificationDomainService: IMobileVerificationDomainService,
  ) {}

  private readonly logger = new Logger(MobileVerificationService.name);

  @Cron(CronExpression.EVERY_DAY_AT_11PM, { timeZone: TIME_ZONE.SEOUL })
  async callCleanUp() {
    const result = await this.mobileVerificationDomainService.cleanUp();

    this.logger.log(`문자 인증 요청 ${result.affected}개 삭제 완료`);
  }
}
