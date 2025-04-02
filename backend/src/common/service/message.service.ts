import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_VARIABLE_KEY } from '../const/env.const';
import { COOLSMS_CLIENT } from '../provider/coolsms.provider';
import { ICoolSMS } from '../provider/coolsms.interface';

@Injectable()
export class MessageService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(COOLSMS_CLIENT)
    private readonly smsClient: ICoolSMS,
  ) {}

  private readonly from = this.configService.getOrThrow<string>(
    ENV_VARIABLE_KEY.FROM_NUMBER,
  );

  async sendMessage(mobilePhone: string, text: string) {
    return this.smsClient.sendOne({
      to: mobilePhone,
      from: this.from,
      text,
      autoTypeDetect: true,
    });
  }
}
