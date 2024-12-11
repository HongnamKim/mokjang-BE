import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { OauthDto } from '../dto/oauth.dto';

export const OAuthUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      throw new InternalServerErrorException('로그인 실패');
    }

    return new OauthDto(req.user.provider, req.user.providerId);

    //return oAuthLogin;
  },
);
