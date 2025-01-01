import { AuthType } from '../enum/auth-type.enum';

export type JwtPayload = {
  id: number;
  type: AuthType;
};

export type JwtFullPayload = JwtPayload & { iat: number; exp: number };

export type JwtAccessPayload = {
  id: number;
  type: AuthType.ACCESS;
  iat: number;
  exp: number;
};

export type JwtRefreshPayload = {
  id: number;
  type: AuthType.REFRESH;
  iat: number;
  exp: number;
};

export type JwtTemporalPayload = {
  id: number;
  type: AuthType.TEMP;
  iat: number;
  exp: number;
};
