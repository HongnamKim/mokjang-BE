import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { TempUserModel } from '../entity/temp-user.entity';
import { UserModel } from '../entity/user.entity';
import { AuthType } from '../enum/auth-type.enum';
import { JwtPayload } from '../type/jwt';
import { JwtExpiresConst } from '../const/jwt-expires.const';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signToken(user: TempUserModel | UserModel, authType: AuthType) {
    const payload: JwtPayload = {
      id: user.id,
      type: authType,
    };

    const expiresIn = this.configService.getOrThrow<number>(
      JwtExpiresConst[authType],
    );

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
}
