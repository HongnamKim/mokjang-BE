import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { SubscriptionGuard } from '../../subscription/guard/subscription.guard';
import { ChurchOwnerGuard } from '../../permission/guard/church-owner.guard';

export const ChurchWriteGuard = () =>
  applyDecorators(
    UseGuards(AccessTokenGuard, ChurchOwnerGuard, SubscriptionGuard),
  );
