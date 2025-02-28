import { AuthType } from './enum/auth-type.enum';

export const JwtExpiresConst = {
  [AuthType.TEMP]: 'JWT_EXPIRES_TEMP',
  [AuthType.ACCESS]: 'JWT_EXPIRES_ACCESS',
  [AuthType.REFRESH]: 'JWT_EXPIRES_REFRESH',
};
