import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { ChurchManagerGuard } from '../../../permission/guard/church-manager.guard';

export const OfficerReadGuard = () =>
  applyDecorators(UseGuards(AccessTokenGuard, ChurchManagerGuard));
