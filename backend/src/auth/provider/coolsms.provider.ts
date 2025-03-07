import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import coolsms from 'coolsms-node-sdk';
import { ENV_VARIABLE_KEY } from '../../common/const/env.const';
//import { MESSAGE_SERVICE } from '../const/env.const';

export const COOLSMS_CLIENT = 'COOLSMS_CLIENT';

export const CoolSMSProvider: Provider = {
  provide: COOLSMS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const SMS_API_KEY = configService.getOrThrow<string>(
      ENV_VARIABLE_KEY.SMS_API_KEY,
    );
    const SMS_API_SECRET = configService.getOrThrow<string>(
      ENV_VARIABLE_KEY.SMS_API_SECRET,
    );

    return new coolsms(SMS_API_KEY, SMS_API_SECRET);
  },
};
