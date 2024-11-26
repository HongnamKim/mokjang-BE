import { Provider } from '@nestjs/common';
import coolsms from 'coolsms-node-sdk';

export const COOLSMS_CLIENT = 'COOLSMS_CLIENT';

export const CoolSMSProvider: Provider = {
  provide: COOLSMS_CLIENT,
  useFactory: () => {
    return new coolsms(process.env.SMS_API_KEY, process.env.SMS_API_SECRET);
  },
};
