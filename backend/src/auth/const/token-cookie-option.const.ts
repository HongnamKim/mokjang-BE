import { CookieOptions } from 'express';
import { AuthType } from './enum/auth-type.enum';
import ms from 'ms';

export const TOKEN_COOKIE_OPTIONS = (
  NODE_ENV: string,
  authType: AuthType,
  isClearCookie: boolean = false,
): CookieOptions => {
  const maxAge =
    authType === AuthType.REFRESH
      ? ms('14d')
      : NODE_ENV === 'development'
        ? ms('14d')
        : ms('30m');

  return {
    httpOnly: true,
    secure: NODE_ENV !== 'development',
    sameSite: NODE_ENV === 'development' ? undefined : 'none', //undefined,
    maxAge: isClearCookie ? undefined : maxAge,
  };
};
