import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { JwtPayload } from '../type/jwt';
import { AuthType } from '../enum/auth-type.enum';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../service/token.service';

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
      throw new UnauthorizedException('인증 토큰 필요');
    }

    const token = this.tokenService.extractToken(rawToken);

    const payload: JwtPayload = this.tokenService.verifyToken(token);

    const user =
      payload.type === AuthType.TEMP
        ? await this.authService.getTempUserById(payload.id)
        : await this.authService.getUserById(payload.id);

    req.user = user;

    return true;
  }
}
