import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthType } from '../const/enum/auth-type.enum';
import { AuthException } from '../const/exception/auth.exception';

export const Token: (data: AuthType) => ParameterDecorator =
  createParamDecorator(
    (data: AuthType = undefined as never, context: ExecutionContext) => {
      const token = context.switchToHttp().getRequest().tokenPayload;

      if (!token) {
        throw new InternalServerErrorException(
          AuthException.TOKEN_PROCESS_ERROR,
        );
      }

      if (token.type !== data) {
        throw new UnauthorizedException(AuthException.TOKEN_TYPE_ERROR);
      }

      return token;
    },
  );

/*export const TemporalToken = createParamDecorator(
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
);*/

/*export const AccessToken = createParamDecorator(
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
);*/

/*export const RefreshToken = createParamDecorator(
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
);*/
