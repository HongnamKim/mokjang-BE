import { AuthType } from './enum/auth-type.enum';
import { ENV_VARIABLE_KEY } from '../../common/const/env.const';

export const JwtExpiresConst = {
  [AuthType.TEMP]: ENV_VARIABLE_KEY.JWT_EXPIRES_TEMP,
  [AuthType.ACCESS]: ENV_VARIABLE_KEY.JWT_EXPIRES_ACCESS,
  [AuthType.REFRESH]: ENV_VARIABLE_KEY.JWT_EXPIRES_REFRESH,
};
