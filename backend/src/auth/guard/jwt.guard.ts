import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAccessPayload, JwtRefreshPayload } from '../type/jwt';
import { AuthType } from '../enum/auth-type.enum';
import { TokenService } from '../service/token.service';
import { AuthException } from '../exception/exception.message';

export class JwtGuard implements CanActivate {
  constructor(protected readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers['authorization'];

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
