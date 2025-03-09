import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { TOKEN_COOKIE_OPTIONS } from '../const/token-cookie-option.const';
import { AuthType } from '../const/enum/auth-type.enum';
//import { JWT_COOKIE_KEY } from '../const/env.const';
import { ENV_VARIABLE_KEY } from '../../common/const/env.const';

@Injectable()
export class AuthCookieHelper {
  constructor(private readonly configService: ConfigService) {}

  private NODE_ENV = this.configService.getOrThrow(ENV_VARIABLE_KEY.NODE_ENV);

  private readonly ACCESS_TOKEN: 'accessToken' = 'accessToken';
  private readonly REFRESH_TOKEN: 'refreshToken' = 'refreshToken';
  private readonly TEMPORAL_TOKEN: 'temporal' = 'temporal';

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
    if (this.ACCESS_TOKEN in loginResult && this.REFRESH_TOKEN in loginResult) {
      const encodedAccessToken = this.encodeBase64(loginResult.accessToken);
      const encodedRefreshToken = this.encodeBase64(loginResult.refreshToken);

      res.cookie(
        this.configService.getOrThrow(ENV_VARIABLE_KEY.ACCESS_TOKEN_KEY),
        encodedAccessToken,
        TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.ACCESS),
      );

      res.cookie(
        this.configService.getOrThrow(ENV_VARIABLE_KEY.REFRESH_TOKEN_KEY),
        encodedRefreshToken,
        TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.REFRESH),
      );
    } else if (this.ACCESS_TOKEN in loginResult) {
      const encodedAccessToken = this.encodeBase64(loginResult.accessToken);

      res.cookie(
        this.configService.getOrThrow(ENV_VARIABLE_KEY.ACCESS_TOKEN_KEY),
        encodedAccessToken,
        TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.ACCESS),
      );
    } else if (this.TEMPORAL_TOKEN in loginResult) {
      const encodedTemporalToken = this.encodeBase64(loginResult.temporal);

      res.cookie(
        this.configService.getOrThrow(ENV_VARIABLE_KEY.TEMPORAL_TOKEN_KEY),
        encodedTemporalToken,
        TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.TEMP),
      );
    }
  }

  private createRedirectURL() {
    const protocol = this.configService.getOrThrow(ENV_VARIABLE_KEY.PROTOCOL);
    const clientHost = this.configService.getOrThrow(
      ENV_VARIABLE_KEY.CLIENT_HOST,
    );
    const clientPort = this.configService.get(ENV_VARIABLE_KEY.CLIENT_PORT);
    const redirectURI = this.configService.getOrThrow(
      ENV_VARIABLE_KEY.LOGIN_URI,
    );

    return clientPort
      ? `${protocol}://${clientHost}:${clientPort}${redirectURI}`
      : `${protocol}://${clientHost}${redirectURI}`;
  }

  public handleLoginResult(
    loginResult:
      | { accessToken: string; refreshToken: string }
      | { temporal: string },
    res: Response,
    isTest: boolean = false,
  ) {
    const redirectURL = this.createRedirectURL();

    this.setTokenCookie(loginResult, res);

    if (isTest) {
      return 'login success';
    }

    res.redirect(redirectURL);
  }
}
