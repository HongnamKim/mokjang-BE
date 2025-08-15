import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const RequestManager = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    if (!req.requestManager) {
      throw new InternalServerErrorException('Request 내 ChurchUser 누락');
    }

    return req.requestManager;
  },
);
