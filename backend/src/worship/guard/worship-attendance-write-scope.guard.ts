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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const church = await this.getRequestChurch(req);
    const requestManager = await this.getRequestManager(req, church);

    const worshipId = parseInt(req.params.worshipId);
    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      undefined,
      { worshipTargetGroups: { group: true } },
    );
    const sessionId = parseInt(req.params.sessionId);
    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
      );
    const attendanceId = parseInt(req.params.attendanceId);
    const targetAttendance =
      await this.worshipAttendanceDomainService.findWorshipAttendanceById(
        session,
        attendanceId,
      );

    const targetMemberGroupId =
      targetAttendance.worshipEnrollment.member.group.id;

    // 해당 출석 기록이 예배 대상 그룹에 속하는지 검증
    const rootTargetWorshipGroupIds = worship.worshipTargetGroups.map(
      (targetGroup) => targetGroup.group.id,
    );

    const targetWorshipGroupIds = (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        rootTargetWorshipGroupIds,
      )
    ).map((group) => group.id);

    if (!targetWorshipGroupIds.includes(targetMemberGroupId)) {
      throw new ForbiddenException(WorshipException.INVALID_TARGET_GROUP);
    }
    // ------------------------------------

    // 관리자의 권한 범위 내에 있는 출석 정보인지 체크
    const permissionScopeGroupIds = requestManager.permissionScopes.map(
      (scope) => scope.group.id,
    );

    const scopeGroupIds = (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        permissionScopeGroupIds,
      )
    ).map((group) => group.id);

    if (!scopeGroupIds.includes(targetMemberGroupId)) {
      throw new ForbiddenException(
        PermissionScopeException.OUT_OF_SCOPE_MEMBER,
      );
    }

    return true;
  }
}
