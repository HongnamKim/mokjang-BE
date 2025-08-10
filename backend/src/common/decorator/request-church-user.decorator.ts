import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../custom-request';

export const RequestChurchUser = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req: CustomRequest = ctx.switchToHttp().getRequest();

    if (!req.requestChurchUser) {
      throw new InternalServerErrorException('Request 내 ChurchUser 누락');
    }

    return req.requestChurchUser;
  },
);
