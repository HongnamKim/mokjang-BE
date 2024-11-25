import { Injectable } from '@nestjs/common';
import coolsms from 'coolsms-node-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MessagesService {
  private readonly message;

  constructor() {
    this.message = new coolsms(
      process.env.SMS_API_KEY,
      process.env.SMS_API_SECRET,
    );
  }

  private readonly from: string = process.env.FROM_NUMBER;

  async sendInvitation(mobilePhone: string, message: string) {
    return this.message.sendOne({
      to: mobilePhone,
      from: this.from,
      text: message,
      autoTypeDetect: true,
    });
  }
}
