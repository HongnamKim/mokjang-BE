import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthType } from '../enum/auth-type.enum';
import { AuthException } from '../exception/exception.message';

export const JwtDecorator = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      throw new InternalServerErrorException();
    }

    return req.user;
  },
);

export const TemporalToken = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.tokenPayload) {
      throw new InternalServerErrorException(AuthException.TOKEN_PROCESS_ERROR);
    }

    if (req.tokenPayload.type !== AuthType.TEMP) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    return req.tokenPayload;
  },
);

export const AccessToken = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.tokenPayload) {
      throw new InternalServerErrorException(AuthException.TOKEN_PROCESS_ERROR);
    }

    if (req.tokenPayload.type !== AuthType.ACCESS) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    return req.tokenPayload;
  },
);

export const RefreshToken = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.tokenPayload) {
      throw new InternalServerErrorException(AuthException.TOKEN_PROCESS_ERROR);
    }

    if (req.tokenPayload.type !== AuthType.REFRESH) {
      throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
    }

    return req.tokenPayload;
  },
);
