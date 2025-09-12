import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';

export const RequestVisitation = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req: CustomRequest = ctx.switchToHttp().getRequest();

    if (req.targetVisitation) {
      return req.targetVisitation;
    } else {
      throw new InternalServerErrorException('대상 심방 처리 누락');
    }
  },
);
