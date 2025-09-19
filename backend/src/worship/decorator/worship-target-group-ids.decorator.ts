import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';

export const WorshipTargetGroupIds = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req: CustomRequest = ctx.switchToHttp().getRequest();

    return req.worshipTargetGroupIds;
  },
);
