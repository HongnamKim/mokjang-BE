import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';

export const PermissionScopeIds = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req: CustomRequest = ctx.switchToHttp().getRequest();

    if (req.permissionScopeIds) {
      return req.permissionScopeIds;
    }

    throw new InternalServerErrorException('관리자 권한범위 처리 누락');
  },
);
