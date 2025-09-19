import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';

export const RequestOwner = createParamDecorator((_, ctx: ExecutionContext) => {
  const req: CustomRequest = ctx.switchToHttp().getRequest();

  if (!req.requestOwner) {
    throw new InternalServerErrorException('Request 내 Owner 누락');
  }

  return req.requestOwner;
});
