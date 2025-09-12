import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomRequest } from '../../common/custom-request';
import { ChurchModel } from '../../churches/entity/church.entity';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import {
  IVISITATION_META_DOMAIN_SERVICE,
  IVisitationMetaDomainService,
} from '../visitation-domain/interface/visitation-meta-domain.service.interface';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { PermissionScopeModel } from '../../permission/entity/permission-scope.entity';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { ChurchUserRole } from '../../user/const/user-role.enum';
import { VisitationException } from '../const/exception/visitation.exception';

@Injectable()
export class VisitationScopeGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(IVISITATION_META_DOMAIN_SERVICE)
    private readonly visitationDomainService: IVisitationMetaDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  private async getRequestChurch(req: CustomRequest) {
    if (req.church) {
      return req.church;
    } else {
      const churchId = parseInt(req.params.churchId);

      const church =
        await this.churchesDomainService.findChurchModelById(churchId);

      req.church = church;

      return church;
    }
  }

  private async getRequestManager(req: CustomRequest, church: ChurchModel) {
    if (req.requestManager) {
      return req.requestManager;
    } else {
      const token = req.tokenPayload;

      if (!token) {
        throw new InternalServerErrorException('토큰 처리 과정 누락');
      }

      const requestUserId = token.id;
      const requestManager =
        await this.managerDomainService.findManagerForPermissionCheck(
          church,
          requestUserId,
        );

      req.requestManager = requestManager;

      return requestManager;
    }
  }

  private async getPermissionScopeGroupIds(
    church: ChurchModel,
    requestManager: ChurchUserModel,
  ) {
    const rootPermissionScopeGroupIds = requestManager.permissionScopes.map(
      (permissionScope: PermissionScopeModel) => permissionScope.group.id,
    );

    // 제한된 권한 범위의 관리자 검증
    return (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        rootPermissionScopeGroupIds,
      )
    ).map((group) => group.id);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();

    const church = await this.getRequestChurch(req);
    const requestManager = await this.getRequestManager(req, church);

    const visitationId = parseInt(req.params.visitationId);

    // 목록 조회 시 검증 X
    if (!visitationId) {
      return true;
    }

    // 대상 심방
    const targetVisitation =
      await this.visitationDomainService.findVisitationMetaById(
        church,
        visitationId,
      );

    req.targetVisitation = targetVisitation;

    // 소유자
    if (requestManager.role === ChurchUserRole.OWNER) {
      return true;
    } else {
      // 전체 권한 범위
      if (requestManager.permissionScopes.some((scope) => scope.isAllGroups))
        return true;
    }

    // 심방 대상 교인들
    const members = targetVisitation.members;

    // 심방 대상의 그룹 ID
    const memberGroupIds = members.map((member) =>
      member.group ? member.group.id : null,
    );

    // 소속 그룹이 없는 교인은 전체 권한 범위 매니저만 접근 가능
    if (memberGroupIds.includes(null)) {
      throw new ForbiddenException(
        VisitationException.OUT_OF_SCOPE_MEMBER_INCLUDE,
      );
    }

    // 요청자의 권한 범위 내 모든 그룹 ID
    const permissionGroupIds = await this.getPermissionScopeGroupIds(
      church,
      requestManager,
    );

    const permissionGroupIdsSet = new Set(permissionGroupIds);

    // 심방 대상 교인들의 그룹이 권한 범위 내에 속하는지 확인
    let isAllowed: boolean = true;
    for (const memberGroupId of memberGroupIds) {
      if (memberGroupId === null) {
        isAllowed = false;
        throw new ForbiddenException(
          VisitationException.OUT_OF_SCOPE_MEMBER_INCLUDE,
        );
      } else if (!permissionGroupIdsSet.has(memberGroupId)) {
        isAllowed = false;
        throw new ForbiddenException(
          VisitationException.OUT_OF_SCOPE_MEMBER_INCLUDE,
        );
      }
    }

    return isAllowed;
  }
}
