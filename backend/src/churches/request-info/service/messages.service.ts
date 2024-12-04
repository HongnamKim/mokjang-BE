import { Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { COOLSMS_CLIENT } from '../provider/coolsms.provider';
import { ICoolSMS } from '../provider/coolsms.interface';
import { ConfigService } from '@nestjs/config';

dotenv.config();

@Injectable()
export class MessagesService {
  constructor(
    @Inject(COOLSMS_CLIENT) private readonly smsClient: ICoolSMS,
    private readonly configService: ConfigService,
  ) {}

  private readonly from = this.configService.getOrThrow<string>('FROM_NUMBER');

  async sendRequestInfoMessage(mobilePhone: string, message: string) {
    return this.smsClient.sendOne({
      to: mobilePhone,
      from: this.from,
      text: message,
      autoTypeDetect: true,
    });
  }
}
