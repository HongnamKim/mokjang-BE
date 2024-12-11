import { AuthType } from '../enum/auth-type.enum';

export type JwtPayload = {
  id: number;
  type: AuthType;
};
