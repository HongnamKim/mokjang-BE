import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';

export const TargetMember = createParamDecorator((_, ctx: ExecutionContext) => {
  const req: CustomRequest = ctx.switchToHttp().getRequest();

  if (req.targetMember) {
    return req.targetMember;
  } else {
    throw new InternalServerErrorException('요청 처리 대상 교인 처리 누락');
  }
});
