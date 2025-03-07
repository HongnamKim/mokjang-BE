import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ENV_VARIABLE_KEY } from '../../common/const/env.const';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = this.configService.getOrThrow<string>(
      ENV_VARIABLE_KEY.JWT_SECRET,
    );
  }

  private readonly secretKey: string;

  async use(req: Request, res: Response, next: NextFunction) {
    const accessTokenCookie = req.cookies[ENV_VARIABLE_KEY.ACCESS_TOKEN_KEY];

    // AccessToken 쿠키가 없으면 통과
    if (!accessTokenCookie) {
      next();
    }

    try {
      // 쿠키 값을 디코딩 --> ${header}.${payload}.${signature}
      const accessToken = Buffer.from(accessTokenCookie, 'base64').toString();

      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.secretKey,
      });
      req.user = payload;

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료됐습니다.');
      }
    }
  }
}
