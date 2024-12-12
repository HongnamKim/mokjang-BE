import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const JwtDecorator = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      throw new InternalServerErrorException();
    }

    return req.user;
  },
);

export const RefreshToken = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      throw new InternalServerErrorException();
    }

    return req.user;
  },
);
