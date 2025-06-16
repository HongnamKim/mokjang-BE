import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import {
  IMEMBER_FILTER_SERVICE,
  IMemberFilterService,
} from '../../members/service/interface/member-filter.service.interface';
import { HttpMethod } from '../../common/const/http-method.enum';
import { PermissionScopeException } from '../exception/permission-scope.exception';

export function createScopeGuard(
  excludeHttpMethods: HttpMethod[],
): Type<CanActivate> {
  @Injectable()
  class GenericScopeGuard implements CanActivate {
    constructor(
      @Inject(IMEMBERS_DOMAIN_SERVICE)
      private readonly membersDomainService: IMembersDomainService,
      @Inject(IMEMBER_FILTER_SERVICE)
      private readonly memberFilterService: IMemberFilterService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();

      // 수정, 삭제 시에만 가드 적용
      if (excludeHttpMethods.includes(req.method)) {
        return true;
      }

      const requestManager = req.requestManager;
      const church = req.church;

      const memberId = parseInt(req.params.memberId);

      const targetMember = await this.membersDomainService.findMemberModelById(
        church,
        memberId,
      );

      const concealedMember = await this.memberFilterService.filterMember(
        church,
        requestManager,
        targetMember,
      );

      if (concealedMember.isConcealed) {
        throw new ForbiddenException(
          PermissionScopeException.OUT_OF_SCOPE_MEMBER,
        );
      }

      req.targetMember = targetMember;

      return true;
    }
  }

  return mixin(GenericScopeGuard);
}
