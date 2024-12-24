import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import coolsms from 'coolsms-node-sdk';
import { MESSAGE_SERVICE } from '../const/env.const';

export const COOLSMS_CLIENT = 'COOLSMS_CLIENT';

export const CoolSMSProvider: Provider = {
  provide: COOLSMS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const SMS_API_KEY = configService.getOrThrow<string>(
      MESSAGE_SERVICE.SMS_API_KEY,
    );
    const SMS_API_SECRET = configService.getOrThrow<string>(
      MESSAGE_SERVICE.SMS_API_SECRET,
    );

    return new coolsms(SMS_API_KEY, SMS_API_SECRET);
  },
};
