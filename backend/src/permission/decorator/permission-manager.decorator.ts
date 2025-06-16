import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const PermissionManager = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    if (!req.permissionedChurchUser) {
      throw new InternalServerErrorException('Request 내 ChurchUser 누락');
    }

    return req.permissionedChurchUser;
  },
);
