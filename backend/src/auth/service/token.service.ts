import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthType } from '../enum/auth-type.enum';
import { JwtPayload, JwtRefreshPayload } from '../type/jwt';
import { JwtExpiresConst } from '../const/jwt-expires.const';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';

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
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
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
      throw new UnauthorizedException('잘못된 형식의 토큰입니다.');
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
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('만료된 토큰입니다.');
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
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
