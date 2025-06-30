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
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import {
  IWORSHIP_SESSION_DOMAIN_SERVICE,
  IWorshipSessionDomainService,
} from '../worship-domain/interface/worship-session-domain.service.interface';
import {
  IWORSHIP_ATTENDANCE_DOMAIN_SERVICE,
  IWorshipAttendanceDomainService,
} from '../worship-domain/interface/worship-attendance-domain.service.interface';
import { WorshipException } from '../exception/worship.exception';
import { PermissionScopeException } from '../../permission/exception/permission-scope.exception';
import { ChurchUserRole } from '../../user/const/user-role.enum';

@Injectable()
export class WorshipAttendanceWriteScopeGuard implements CanActivate {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,

    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IWORSHIP_SESSION_DOMAIN_SERVICE)
    private readonly worshipSessionDomainService: IWorshipSessionDomainService,
    @Inject(IWORSHIP_ATTENDANCE_DOMAIN_SERVICE)
    private readonly worshipAttendanceDomainService: IWorshipAttendanceDomainService,
  ) {}

  private async getRequestChurch(req: any) {
    const churchId = parseInt(req.params.churchId);

    return req.church
      ? req.church
      : await this.churchesDomainService.findChurchModelById(churchId);
  }

  private async getRequestManager(
    req: any,
    church: ChurchModel,
  ): Promise<ChurchUserModel> {
    const token = req.tokenPayload;

    if (!token) {
      throw new InternalServerErrorException('토큰 처리 과정 누락');
    }

    const requestUserId = token.id;

    return req.requestManager
      ? req.requestManager
      : this.managerDomainService.findManagerForPermissionCheck(
          church,
          requestUserId,
        );
  }

  private async getWorship(req, church: ChurchModel) {
    const worshipId = parseInt(req.params.worshipId);
    const sessionId = parseInt(req.params.sessionId);
    const attendanceId = parseInt(req.params.attendanceId);

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      undefined,
      { worshipTargetGroups: { group: true } },
    );

    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
      );

    const targetAttendance =
      await this.worshipAttendanceDomainService.findWorshipAttendanceById(
        session,
        attendanceId,
      );

    return { worship, session, targetAttendance };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const church = await this.getRequestChurch(req);
    const requestManager = await this.getRequestManager(req, church);

    const { worship, targetAttendance } = await this.getWorship(req, church);

    const targetAttendanceMemberGroupId =
      targetAttendance.worshipEnrollment.member.group.id;

    const rootTargetWorshipGroupIds = worship.worshipTargetGroups.map(
      (targetGroup) => targetGroup.group.id,
    );

    // 모든 예배 대상 그룹 ID
    const targetWorshipGroupIds = (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        rootTargetWorshipGroupIds,
      )
    ).map((group) => group.id);

    // 해당 출석 기록이 예배 대상 그룹에 속하는지 검증
    if (!targetWorshipGroupIds.includes(targetAttendanceMemberGroupId)) {
      throw new ForbiddenException(WorshipException.INVALID_TARGET_GROUP);
    }
    // ------------------------------------

    // 요청한 사람이 해당 교인 출석에 대한 권한 범위를 갖고 있는지 체크

    // 소유자
    if (requestManager.role === ChurchUserRole.OWNER) {
      return true;
    }

    // 전체 권한 범위
    if (requestManager.permissionScopes.some((scope) => scope.isAllGroups)) {
      return true;
    }

    // 관리자의 권한 범위 내에 있는 출석 정보인지 체크
    const rootPermissionScopeGroupIds = requestManager.permissionScopes.map(
      (scope) => scope.group.id,
    );

    const scopeGroupIds = (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        rootPermissionScopeGroupIds,
      )
    ).map((group) => group.id);

    if (!scopeGroupIds.includes(targetAttendanceMemberGroupId)) {
      throw new ForbiddenException(
        PermissionScopeException.OUT_OF_SCOPE_MEMBER,
      );
    }

    return true;
  }
}
