import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';

export const DefaultWorshipGroupIds = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req: CustomRequest = ctx.switchToHttp().getRequest();

    if (req.worshipGroupIds) {
      return req.worshipGroupIds;
    }

    throw new InternalServerErrorException('예배 대상 그룹 처리 누락');
  },
);
