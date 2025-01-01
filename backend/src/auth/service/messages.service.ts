import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { COOLSMS_CLIENT } from '../provider/coolsms.provider';
import { ICoolSMS } from '../provider/coolsms.interface';
import { MESSAGE_SERVICE } from '../const/env.const';

@Injectable()
export class MessagesService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(COOLSMS_CLIENT)
    private readonly smsClient: ICoolSMS,
  ) {}

  private readonly from = this.configService.getOrThrow<string>(
    MESSAGE_SERVICE.FROM_NUMBER,
  );

  async sendVerificationCode(mobilePhone: string, code: string) {
    return this.smsClient.sendOne({
      to: mobilePhone,
      from: this.from,
      text: code,
      autoTypeDetect: true,
    });
  }
}
