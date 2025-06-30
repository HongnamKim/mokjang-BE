import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const RequestWorship = createParamDecorator(
  (a, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    if (!req.worship) {
      throw new InternalServerErrorException('예배 처리 과정 누락');
    }

    return req.worship;
  },
);
