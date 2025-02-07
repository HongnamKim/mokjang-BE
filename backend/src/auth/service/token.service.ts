import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthType } from '../const/enum/auth-type.enum';
import { JwtPayload, JwtRefreshPayload } from '../type/jwt';
import { JwtExpiresConst } from '../const/jwt-expires.const';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { AuthException } from '../const/exception-message/exception.message';
import { JWT } from '../const/env.const';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signToken(userId: number, authType: AuthType) {
    const payload: JwtPayload = {
      id: userId,
      type: authType,
    };

    const expiresIn =
      ms(this.configService.getOrThrow<string>(JwtExpiresConst[authType])) /
      1000;

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>(JWT.JWT_SECRET),
      expiresIn,
    });
  }

  /**
   * raw token 에서 token 을 추출
   * @param rawToken Bearer header.payload.signature
   * @return token
   */
  extractToken(rawToken: string) {
    const split = rawToken.split(' ');

    if (split.length !== 2) {
      throw new UnauthorizedException(AuthException.TOKEN_INVALID);
    }

    return split[1];
  }

  /**
   * payload 를 반환
   * @param token header.payload.signature
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>(JWT.JWT_SECRET),
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(AuthException.TOKEN_EXPIRED);
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(AuthException.TOKEN_INVALID);
      }
    }
  }

  rotateToken(token: JwtRefreshPayload) {
    const jwt = this.signToken(token.id, AuthType.ACCESS);

    return {
      accessToken: jwt,
    };
  }
}
