import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../guard/worship-read-scope.guard';

export const PermissionScopeGroups = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req: CustomRequest = ctx.switchToHttp().getRequest();

    if (!req.permissionScopeGroupIds) {
      throw new InternalServerErrorException('권한 범위 처리 과정 누락');
    }

    return req.permissionScopeGroupIds;
  },
);
