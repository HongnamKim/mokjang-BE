import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAccessPayload, JwtRefreshPayload } from '../type/jwt';
import { AuthType } from '../const/enum/auth-type.enum';
import { TokenService } from '../service/token.service';
import { AuthException } from '../const/exception-message/exception.message';
import { TOKEN_HEADER } from '../const/token-header.const';

export class JwtGuard implements CanActivate {
  constructor(protected readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers[TOKEN_HEADER];

    if (!rawToken) {
      throw new UnauthorizedException(AuthException.TOKEN_REQUIRED);
    }

    const token = this.tokenService.extractToken(rawToken);

    req.tokenPayload = this.tokenService.verifyToken(token);

    return true;
  }
}

@Injectable()
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
}

@Injectable()
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
}

@Injectable()
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
}
