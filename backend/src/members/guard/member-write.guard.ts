import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guard/jwt.guard';
import { createDomainGuard } from '../../permission/guard/generic-domain.guard';
import { DomainType } from '../../permission/const/domain-type.enum';
import { DomainName } from '../../permission/const/domain-name.enum';
import { DomainAction } from '../../permission/const/domain-action.enum';
import { createScopeGuard } from '../../permission/guard/generic-scope.guard';
import { HttpMethod } from '../../common/const/http-method.enum';
import { ChurchManagerGuard } from '../../permission/guard/church-manager.guard';
import { SubscriptionGuard } from '../../subscription/guard/subscription.guard';

export const MemberWriteGuard = () =>
  applyDecorators(
    UseGuards(
      AccessTokenGuard,
      ChurchManagerGuard,
      SubscriptionGuard,
      createDomainGuard(
        DomainType.MEMBER,
        DomainName.MEMBER,
        DomainAction.WRITE,
      ),
      createScopeGuard([HttpMethod.GET, HttpMethod.POST]),
    ),
  );
