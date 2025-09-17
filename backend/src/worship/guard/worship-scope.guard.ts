import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { PermissionScopeModel } from '../../permission/entity/permission-scope.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';
import { PermissionScopeException } from '../../permission/exception/permission-scope.exception';
import { CustomRequest } from '../../common/custom-request';
import { PermissionScopeIdsVo } from '../../permission/vo/permission-scope-ids.vo';

/**
 * 필터링 요청한 그룹이 요청자의 권한 범위 내에 속하는지 검사
 */
@Injectable()
export class WorshipScopeGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  private async getRequestChurch(req: CustomRequest) {
    const churchId = parseInt(req.params.churchId);

    if (req.church) {
      return req.church;
    } else {
      const church =
        await this.churchesDomainService.findChurchModelById(churchId);

      req.church = church;

      return church;
    }
  }

  private async getRequestManager(
    req: CustomRequest,
    church: ChurchModel,
  ): Promise<ChurchUserModel> {
    const token = req.tokenPayload;

    if (!token) {
      throw new InternalServerErrorException('토큰 처리 과정 누락');
    }

    const requestUserId = token.id;

    if (req.requestManager) {
      return req.requestManager;
    } else {
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

    // 소유자
    if (requestManager.role === ChurchUserRole.OWNER) {
      const groupIds = (
        await this.groupsDomainService.findGroupAndDescendantsByIds(
          church,
          [],
          undefined,
          true,
        )
      ).map((group) => group.id);

      req.permissionScopeGroupIds = groupIds;
      req.permissionScopeIds = new PermissionScopeIdsVo(groupIds, true);

      return true;
    }

    // 전체 권한 범위
    if (requestManager.permissionScopes.some((scope) => scope.isAllGroups)) {
      const groupIds = (
        await this.groupsDomainService.findGroupAndDescendantsByIds(
          church,
          [],
          undefined,
          true,
        )
      ).map((group) => group.id);

      req.permissionScopeGroupIds = groupIds;
      req.permissionScopeIds = new PermissionScopeIdsVo(groupIds, true);

      return true;
    }

    // 제한된 권한 범위의 관리자 검증
    const permissionGroupIds = await this.getPermissionScopeGroupIds(
      church,
      requestManager,
    );

    // 권한 범위가 지정되지 않은 관리자
    if (permissionGroupIds.length === 0) {
      throw new ForbiddenException(
        PermissionScopeException.NO_PERMISSION_SCOPE,
      );
    }

    req.permissionScopeGroupIds = permissionGroupIds;
    req.permissionScopeIds = new PermissionScopeIdsVo(
      permissionGroupIds,
      false,
    );

    // 조회 요청 그룹 ID
    let requestGroupId: number | undefined;

    if (req.query.groupId) {
      // 쿼리 파라미터
      requestGroupId = parseInt(req.query.groupId as string); // number | NaN
    } else if (req.body.groupId) {
      // 요청 본문
      requestGroupId = parseInt(req.body.groupId as string); // number | NaN
    } else {
      // 필터링 없을 때
      requestGroupId = undefined;
    }

    if (Number.isNaN(requestGroupId)) {
      if (!req.permissionScopeIds.isAllGroups) {
        throw new ForbiddenException(
          PermissionScopeException.OUT_OF_SCOPE_GROUP,
        );
      }
    }

    if (!requestGroupId) {
      return true;
    }

    if (!permissionGroupIds.includes(requestGroupId)) {
      throw new ForbiddenException(PermissionScopeException.OUT_OF_SCOPE_GROUP);
    }

    return true;
  }
}
