import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { createDomainGuard } from './generic-domain.guard';
import { DomainType } from '../const/domain-type.enum';
import { DomainName } from '../const/domain-name.enum';
import { DomainAction } from '../const/domain-action.enum';
import { ChurchManagerGuard } from './church-manager.guard';

export const PermissionReadGuard = () =>
  applyDecorators(
    UseGuards(
      AccessTokenGuard,
      ChurchManagerGuard,
      createDomainGuard(
        DomainType.PERMISSION,
        DomainName.PERMISSION,
        DomainAction.READ,
      ),
    ),
  );
