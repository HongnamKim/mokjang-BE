import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TargetMember = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  return req.targetMember;
});
