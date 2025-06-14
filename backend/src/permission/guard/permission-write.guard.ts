import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { createDomainGuard } from './generic-domain.guard';
import { DomainType } from '../const/domain-type.enum';
import { DomainName } from '../const/domain-name.enum';
import { DomainAction } from '../const/domain-action.enum';

export const PermissionWriteGuard = () =>
  applyDecorators(
    UseGuards(
      AccessTokenGuard,
      createDomainGuard(
        DomainType.PERMISSION,
        DomainName.PERMISSION,
        DomainAction.WRITE,
      ),
    ),
  );
