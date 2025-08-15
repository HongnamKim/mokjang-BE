import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const RequestChurch = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    if (!req.church) {
      throw new InternalServerErrorException('Request 내 Church 누락');
    }

    return req.church;
  },
);
