import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  Get,
  InternalServerErrorException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { AuthException } from '../exception/exception.message';

export const OAuthLogin = (provider: string) => {
  return applyDecorators(
    Get(`login/${provider}`),
    UseGuards(AuthGuard(provider)),
  );
};

export const OAuthRedirect = (provider: string) => {
  return applyDecorators(
    Get(`login/${provider}/redirect`),
    ApiExcludeEndpoint(),
    UseGuards(AuthGuard(provider)),
    UseInterceptors(TransactionInterceptor),
  );
};
export const OAuthUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      throw new InternalServerErrorException(AuthException.LOGIN_ERROR);
    }

    return req.user;
  },
);
