import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { DomainName } from '../../permission/const/domain-name.enum';

export const WorshipReadGuard = () =>
  applyDecorators(
    UseGuards(
      AccessTokenGuard,
      createDomainGuard(
        DomainType.WORSHIP,
        DomainName.WORSHIP,
        DomainAction.READ,
      ),
    ),
  );
