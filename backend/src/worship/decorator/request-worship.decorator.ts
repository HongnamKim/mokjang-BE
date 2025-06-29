import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestWorship = createParamDecorator(
  (a, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    return req.worship;
  },
);
