import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';

export const PermissionScopeGroups = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req: CustomRequest = ctx.switchToHttp().getRequest();

    /*if (req.permissionScopeGroupIds === undefined) {
      throw new InternalServerErrorException('권한 범위 처리 과정 누락');
    }*/

    return req.permissionScopeGroupIds;
  },
);
