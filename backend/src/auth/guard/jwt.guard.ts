import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtPayload, JwtRefreshPayload } from '../type/jwt';
import { AuthType } from '../enum/auth-type.enum';
import { TokenService } from '../service/token.service';
import { Observable } from 'rxjs';
import { TOKEN_HEADER } from '../const/token-header.const';
import { AuthException } from '../exception/exception.message';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException(AuthException.TOKEN_REQUIRED);
    }

    const token = this.tokenService.extractToken(rawToken);

    const payload: JwtPayload & { iat: number; exp: number } =
      this.tokenService.verifyToken(token);

    req.user =
      payload.type === AuthType.TEMP
        ? await this.authService.getTempUserById(payload.id)
        : await this.authService.getUserById(payload.id);

    return true;
  }
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers[TOKEN_HEADER];

    if (!rawToken) {
      throw new UnauthorizedException(AuthException.TOKEN_REQUIRED);
    }

    const token = this.tokenService.extractToken(rawToken);

    const payload: JwtRefreshPayload = this.tokenService.verifyToken(token);

    if (payload.type !== AuthType.REFRESH) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    req.user = payload;

    return true;
  }
}
