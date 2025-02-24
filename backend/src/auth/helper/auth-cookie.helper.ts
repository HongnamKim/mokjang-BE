import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { TOKEN_COOKIE_OPTIONS } from '../const/token-cookie-option.const';
import { AuthType } from '../const/enum/auth-type.enum';
import { JWT_COOKIE_KEY, NETWORK, NODE_ENV } from '../const/env.const';

@Injectable()
export class AuthCookieHelper {
  constructor(private readonly configService: ConfigService) {}

  private NODE_ENV = this.configService.getOrThrow(NODE_ENV);

  private encodeBase64(token: string) {
    return Buffer.from(token).toString('base64');
  }

  public setTokenCookie(
    loginResult:
      | { accessToken: string; refreshToken: string }
      | { temporal: string }
      | { accessToken: string },
    res: Response,
  ) {
    if ('accessToken' in loginResult && 'refreshToken' in loginResult) {
      const encodedAccessToken = this.encodeBase64(loginResult.accessToken);
      const encodedRefreshToken = this.encodeBase64(loginResult.refreshToken);

      res.cookie(
        this.configService.getOrThrow(JWT_COOKIE_KEY.ACCESS_TOKEN_KEY),
        encodedAccessToken,
        TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.ACCESS),
      );

      res.cookie(
        this.configService.getOrThrow(JWT_COOKIE_KEY.REFRESH_TOKEN_KEY),
        encodedRefreshToken,
        TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.REFRESH),
      );
    } else if ('accessToken' in loginResult) {
      const encodedAccessToken = this.encodeBase64(loginResult.accessToken);

      res.cookie(
        this.configService.getOrThrow(JWT_COOKIE_KEY.ACCESS_TOKEN_KEY),
        encodedAccessToken,
        TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.ACCESS),
      );
    } else if ('temporal' in loginResult) {
      const encodedTemporalToken = this.encodeBase64(loginResult.temporal);

      res.cookie(
        this.configService.getOrThrow(JWT_COOKIE_KEY.TEMPORAL_TOKEN_KEY),
        encodedTemporalToken,
        TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.TEMP),
      );
    }
  }

  private createRedirectURL() {
    const protocol = this.configService.getOrThrow(NETWORK.PROTOCOL);
    const clientHost = this.configService.getOrThrow(NETWORK.CLIENT_HOST);
    const clientPort = this.configService.get(NETWORK.CLIENT_PORT);
    const redirectURI = this.configService.getOrThrow(NETWORK.LOGIN_URI);

    return clientPort
      ? `${protocol}://${clientHost}:${clientPort}${redirectURI}`
      : `${protocol}://${clientHost}${redirectURI}`;
  }

  public handleLoginResult(
    loginResult:
      | { accessToken: string; refreshToken: string }
      | { temporal: string },
    res: Response,
    isTest: boolean,
  ) {
    const redirectURL = this.createRedirectURL();

    this.setTokenCookie(loginResult, res);

    if (isTest) {
      return 'login success';
    }

    res.redirect(redirectURL);
  }
}
