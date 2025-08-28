import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  const req: CustomRequest = ctx.switchToHttp().getRequest();

  if (!req.user) {
    throw new InternalServerErrorException('User 처리 누락');
  }

  return req.user;
});
