import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';

export const RequestManager = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req: CustomRequest = ctx.switchToHttp().getRequest();

    if (!req.requestManager) {
      throw new InternalServerErrorException('Request 내 ChurchUser 누락');
    }

    return req.requestManager;
  },
);
