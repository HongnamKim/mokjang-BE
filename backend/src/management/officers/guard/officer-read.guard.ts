import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../../auth/guard/jwt.guard';
import { createDomainGuard } from '../../../permission/guard/generic-domain.guard';
import { DomainType } from '../../../permission/const/domain-type.enum';
import { DomainName } from '../../../permission/const/domain-name.enum';
import { DomainAction } from '../../../permission/const/domain-action.enum';

export const OfficerReadGuard = () =>
  applyDecorators(
    UseGuards(
      AccessTokenGuard,
      createDomainGuard(
        DomainType.MANAGEMENT,
        DomainName.OFFICER,
        DomainAction.READ,
      ),
    ),
  );
