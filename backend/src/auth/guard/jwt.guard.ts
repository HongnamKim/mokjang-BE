import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthType } from '../const/enum/auth-type.enum';
import { TokenService } from '../service/token.service';
import { AuthException } from '../const/exception-message/exception.message';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ENV_VARIABLE_KEY } from '../../common/const/env.const';

@Injectable()
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
}

@Injectable()
export class AccessTokenGuardV2 implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const tokenCookieKey = this.configService.getOrThrow(
      ENV_VARIABLE_KEY.ACCESS_TOKEN_KEY,
    );
    const rawAccessToken = req.cookies[tokenCookieKey];

    if (!rawAccessToken) {
      throw new UnauthorizedException(AuthException.TOKEN_REQUIRED);
    }

    const token = this.tokenService.extractToken(
      'Bearer ' + Buffer.from(rawAccessToken, 'base64').toString(),
    );

    const payload = this.tokenService.verifyToken(token);

    if (payload.type !== AuthType.ACCESS) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    req.tokenPayload = payload;

    return true;
  }
}

@Injectable()
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
}

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
