import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthType } from '../const/enum/auth-type.enum';
import { AuthException } from '../const/exception-message/exception.message';
import { ConfigService } from '@nestjs/config';
import { ENV_VARIABLE_KEY } from '../../common/const/env.const';
import { Request } from 'express';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';

abstract class JwtTokenGuard implements CanActivate {
  protected constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tokenType: 'access' | 'refresh' | 'temporal',
  ) {}

  private tokenCookieKey = {
    access: ENV_VARIABLE_KEY.ACCESS_TOKEN_KEY,
    refresh: ENV_VARIABLE_KEY.REFRESH_TOKEN_KEY,
    temporal: ENV_VARIABLE_KEY.TEMPORAL_TOKEN_KEY,
  };

  private extractTokenFromCookie(req: Request) {
    const tokenCookieKey = this.configService.getOrThrow(
      this.tokenCookieKey[this.tokenType],
    );

    const rawToken = req.cookies[tokenCookieKey];

    if (!rawToken) {
      throw new UnauthorizedException(AuthException.TOKEN_REQUIRED);
    }

    return Buffer.from(rawToken, 'base64').toString('utf-8');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = this.extractTokenFromCookie(req);

    const jwtSecret = this.configService.getOrThrow(
      ENV_VARIABLE_KEY.JWT_SECRET,
    );

    try {
      req.tokenPayload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(AuthException.TOKEN_EXPIRED);
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(AuthException.TOKEN_INVALID);
      }

      return false;
    }
  }
}

@Injectable()
export class TemporalTokenGuard extends JwtTokenGuard {
  constructor(configService: ConfigService, jwtService: JwtService) {
    super(configService, jwtService, 'temporal');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    const payload = req.tokenPayload;

    if (payload.type !== AuthType.TEMP) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends JwtTokenGuard {
  constructor(configService: ConfigService, jwtService: JwtService) {
    super(configService, jwtService, 'access');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    const payload = req.tokenPayload;

    if (payload.type !== AuthType.ACCESS) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    return true;
  }
}

@Injectable()
export class RefreshTokenGuard extends JwtTokenGuard {
  constructor(configService: ConfigService, jwtService: JwtService) {
    super(configService, jwtService, 'refresh');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    const payload = req.tokenPayload;

    if (payload.type !== AuthType.REFRESH) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    return true;
  }
}

/*@Injectable()
export class TemporalTokenGuardV2 implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const tokenCookieKey = this.configService.getOrThrow(
      ENV_VARIABLE_KEY.TEMPORAL_TOKEN_KEY,
    );

    const rawTemporalToken = req.cookies[tokenCookieKey];

    if (!rawTemporalToken) {
      throw new UnauthorizedException(AuthException.TOKEN_REQUIRED);
    }

    const token = this.tokenService.extractToken(
      'Bearer ' + Buffer.from(rawTemporalToken, 'base64').toString(),
    );

    const payload = this.tokenService.verifyToken(token);

    if (payload.type !== AuthType.TEMP) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    req.tokenPayload = payload;

    return true;
  }
}*/

/*@Injectable()
export class AccessTokenGuardV2 implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private extractTokenFromCookie(req: Request, tokenCookieKey: string) {
    const rawToken = req.cookies[tokenCookieKey];

    if (!rawToken) {
      throw new UnauthorizedException(AuthException.TOKEN_REQUIRED);
    }

    return Buffer.from(rawToken, 'base64').toString();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const tokenCookieKey = this.configService.getOrThrow(
      ENV_VARIABLE_KEY.ACCESS_TOKEN_KEY,
    );

    const token = this.extractTokenFromCookie(req, tokenCookieKey);

    const tokenType = this.jwtService.decode(
      token,
      this.configService.getOrThrow(ENV_VARIABLE_KEY.JWT_SECRET),
    ).type;

    if (tokenType !== AuthType.ACCESS) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    try {
      //const payload = this.tokenService.verifyToken(token);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow(ENV_VARIABLE_KEY.JWT_SECRET),
      });

      req.tokenPayload = payload;

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(AuthException.TOKEN_EXPIRED);
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(AuthException.TOKEN_INVALID);
      }
      return false;
    }
  }
}*/

/*@Injectable()
export class RefreshTokenGuardV2 implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const tokenCookieKey = this.configService.getOrThrow(
      ENV_VARIABLE_KEY.REFRESH_TOKEN_KEY,
    );
    const rawRefreshToken = req.cookies[tokenCookieKey];

    if (!rawRefreshToken) {
      throw new UnauthorizedException(AuthException.TOKEN_REQUIRED);
    }

    const token = this.tokenService.extractToken(
      'Bearer ' + Buffer.from(rawRefreshToken, 'base64').toString(),
    );

    const payload = this.tokenService.verifyToken(token);

    if (payload.type !== AuthType.REFRESH) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    req.tokenPayload = payload;

    return true;
  }
}*/

/*@Injectable()
export class TemporalTokenGuard extends JwtGuard {
  constructor(protected readonly tokenService: TokenService) {
    super(tokenService);
  }

  canActivate(context: ExecutionContext) {
    super.canActivate(context);

    const req = context.switchToHttp().getRequest();
    const payload = req.tokenPayload;

    if (payload.type !== AuthType.TEMP) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    return true;
  }
}*/

/*@Injectable()
export class AccessTokenGuard extends JwtGuard {
  constructor(protected readonly tokenService: TokenService) {
    super(tokenService);
  }

  canActivate(context: ExecutionContext): boolean {
    // 토큰 검증, payload 추출
    super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    const payload: JwtAccessPayload = req.tokenPayload;

    if (payload.type !== AuthType.ACCESS) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    return true;
  }
}*/

/*@Injectable()
export class RefreshTokenGuard extends JwtGuard {
  constructor(protected readonly tokenService: TokenService) {
    super(tokenService);
  }

  canActivate(context: ExecutionContext): boolean {
    super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    const payload: JwtRefreshPayload = req.tokenPayload;

    if (payload.type !== AuthType.REFRESH) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    return true;
  }
}*/
