import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('api key 누락');
    }

    // TODO api key 검증 로직 필요

    return true;
  }
}
