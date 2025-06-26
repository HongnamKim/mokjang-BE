import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainName } from '../../permission/const/domain-name.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';

export const ChurchJoinWriteGuard = () =>
  applyDecorators(
    UseGuards(
      AccessTokenGuard,
      createDomainGuard(
        DomainType.PERMISSION,
        DomainName.CHURCH_JOIN,
        DomainAction.WRITE,
      ),
    ),
  );
