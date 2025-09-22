import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_VARIABLE_KEY } from '../const/env.const';
import { SolapiMessageService } from 'solapi';

export const COOLSMS_CLIENT = Symbol('COOLSMS_CLIENT');

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

    return new SolapiMessageService(SMS_API_KEY, SMS_API_SECRET);

    //return new coolsms(SMS_API_KEY, SMS_API_SECRET);
  },
};
