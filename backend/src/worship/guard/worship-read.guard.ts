import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { DomainName } from '../../permission/const/domain-name.enum';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';

export const WorshipReadGuard = () =>
  applyDecorators(
    UseGuards(
      AccessTokenGuard,
      ChurchManagerGuard,
      createDomainGuard(
        DomainType.WORSHIP,
        DomainName.WORSHIP,
        DomainAction.READ,
      ),
    ),
  );
