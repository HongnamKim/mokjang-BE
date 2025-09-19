import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';

export const MinistryReadGuard = () =>
  applyDecorators(UseGuards(AccessTokenGuard, ChurchManagerGuard));
