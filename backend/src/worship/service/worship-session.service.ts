import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  IWORSHIP_SESSION_DOMAIN_SERVICE,
  IWorshipSessionDomainService,
} from '../worship-domain/interface/worship-session-domain.service.interface';
import { QueryRunner } from 'typeorm';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import { PostWorshipSessionResponseDto } from '../dto/response/worship-session/post-worship-session-response.dto';
import { GetWorshipSessionsDto } from '../dto/request/worship-session/get-worship-sessions.dto';
import { WorshipSessionPaginationResponseDto } from '../dto/response/worship-session/worship-session-pagination-response.dto';
import { DeleteWorshipSessionResponseDto } from '../dto/response/worship-session/delete-worship-session.response.dto';
import { UpdateWorshipSessionDto } from '../dto/request/worship-session/update-worship-session.dto';
import { WorshipSessionException } from '../exception/worship-session.exception';
import { PatchWorshipSessionResponseDto } from '../dto/response/worship-session/patch-worship-session-response.dto';
import { WorshipModel } from '../entity/worship.entity';
import {
  IWORSHIP_ATTENDANCE_DOMAIN_SERVICE,
  IWorshipAttendanceDomainService,
} from '../worship-domain/interface/worship-attendance-domain.service.interface';
import {
  IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
  IWorshipEnrollmentDomainService,
} from '../worship-domain/interface/worship-enrollment-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { fromZonedTime } from 'date-fns-tz';
import { differenceInWeeks, getDay, subWeeks } from 'date-fns';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { GetWorshipSessionDto } from '../dto/request/worship-session/get-worship-session.dto';
import { GetWorshipSessionStatsDto } from '../dto/request/worship-session/get-worship-session-stats.dto';
import { ChurchModel } from '../../churches/entity/church.entity';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { getIntersection, getRecentSessionDate } from '../utils/worship-utils';
import { GetWorshipSessionCheckStatusDto } from '../dto/request/worship-session/get-worship-session-check-status.dto';
import {
  getFromDate,
  getToDate,
} from '../../member-history/history-date.utils';
import { WorshipGroupIdsVo } from '../vo/worship-group-ids.vo';
import { PermissionScopeIdsVo } from '../../permission/vo/permission-scope-ids.vo';
import { GetWorshipSessionCheckStatusResponseDto } from '../dto/response/worship-session/get-worship-session-check-status-response.dto';

@Injectable()
export class WorshipSessionService {
  constructor(
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

    @Inject(IWORSHIP_SESSION_DOMAIN_SERVICE)
    private readonly worshipSessionDomainService: IWorshipSessionDomainService,
    @Inject(IWORSHIP_ENROLLMENT_DOMAIN_SERVICE)
    private readonly worshipEnrollmentDomainService: IWorshipEnrollmentDomainService,
    @Inject(IWORSHIP_ATTENDANCE_DOMAIN_SERVICE)
    private readonly worshipAttendanceDomainService: IWorshipAttendanceDomainService,

    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  async getWorshipSessions(
    church: ChurchModel,
    worshipId: number,
    dto: GetWorshipSessionsDto,
  ) {
    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
    );

    const data = await this.worshipSessionDomainService.findWorshipSessions(
      worship,
      dto,
    );

    return new WorshipSessionPaginationResponseDto(data);
  }

  async getSessionCheckStatus(
    church: ChurchModel,
    worship: WorshipModel,
    defaultWorshipGroupIds: WorshipGroupIdsVo,
    permissionScopeIds: PermissionScopeIdsVo,
    dto: GetWorshipSessionCheckStatusDto,
  ) {
    const requestGroupIds = await this.getRequestGroupIds(
      church,
      defaultWorshipGroupIds,
      dto.groupId,
    );

    const intersectionGroupIds = getIntersection(
      requestGroupIds,
      permissionScopeIds,
    );

    if (
      intersectionGroupIds.groupIds.length === 0 &&
      !permissionScopeIds.isAllGroups
    ) {
      // 현재 권한에서 조회할 수 있는 그룹이 없는 경우
      return { data: [], timestamp: new Date() };
    }

    const from = dto.from
      ? getFromDate(dto.from, TIME_ZONE.SEOUL)
      : subWeeks(getRecentSessionDate(worship, TIME_ZONE.SEOUL), 14);
    const to = dto.from
      ? getToDate(dto.to, TIME_ZONE.SEOUL)
      : getRecentSessionDate(worship, TIME_ZONE.SEOUL);

    if (differenceInWeeks(to, from) > 15) {
      throw new BadRequestException('지원하지 않는 기간 범위입니다.');
    }

    const result =
      await this.worshipSessionDomainService.findSessionCheckStatus(
        worship,
        intersectionGroupIds,
        from,
        to,
      );

    return new GetWorshipSessionCheckStatusResponseDto(result);
    //return { data: result, timestamp: new Date() };
  }

  /**
   * 예배 세션 수동 생성
   * @param church
   * @param worshipId
   * @param dto
   * @param qr
   */
  async getOrPostWorshipSession(
    church: ChurchModel,
    worshipId: number,
    dto: GetWorshipSessionDto,
    qr: QueryRunner,
  ) {
    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );

    let sessionDate: Date;

    if (!dto.sessionDate) {
      sessionDate = getRecentSessionDate(worship, TIME_ZONE.SEOUL);
    } else {
      sessionDate = fromZonedTime(dto.sessionDate, TIME_ZONE.SEOUL);

      if (sessionDate.getTime() > Date.now()) {
        throw new BadRequestException(
          WorshipSessionException.INVALID_SESSION_DATE,
        );
      }

      if (getDay(dto.sessionDate) !== worship.worshipDay) {
        throw new ConflictException(
          WorshipSessionException.INVALID_SESSION_DAY,
        );
      }
    }

    const session =
      await this.worshipSessionDomainService.findOrCreateWorshipSession(
        worship,
        sessionDate,
        qr,
      );

    // 예배 세션의 하위 출석 정보 생성
    if (session.isCreated) {
      const enrollments =
        await this.worshipEnrollmentDomainService.findAllEnrollments(
          worship,
          qr,
          sessionDate,
        );

      await this.worshipAttendanceDomainService.refreshAttendances(
        session,
        enrollments,
        qr,
      );

      session.inChargeId = null;
      session.inCharge = null;
    }

    return new PostWorshipSessionResponseDto(session);
  }

  async getWorshipSessionStatistics(
    church: ChurchModel,
    worship: WorshipModel,
    sessionId: number,
    defaultWorshipGroupIds: WorshipGroupIdsVo,
    permissionScopeIds: PermissionScopeIdsVo,
    dto: GetWorshipSessionStatsDto,
  ) {
    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
      );

    const requestGroupIds = await this.getRequestGroupIds(
      church,
      defaultWorshipGroupIds,
      dto.groupId,
    );

    const intersectionGroupIds = getIntersection(
      requestGroupIds,
      permissionScopeIds,
    );

    if (
      intersectionGroupIds.groupIds.length === 0 &&
      !permissionScopeIds.isAllGroups
    ) {
      return {
        totalCount: 0,
        presentCount: 0,
        absentCount: 0,
        unknownCount: 0,
      };
    }

    const stats =
      await this.worshipAttendanceDomainService.getAttendanceStatsBySession(
        session,
        intersectionGroupIds,
      );

    return {
      totalCount: stats.presentCount + stats.absentCount + stats.unknownCount,
      presentCount: stats.presentCount,
      absentCount: stats.absentCount,
      unknownCount: stats.unknownCount,
    };
  }

  private async getRequestGroupIds(
    church: ChurchModel,
    defaultWorshipGroupIds: WorshipGroupIdsVo,
    groupId?: number,
  ) {
    // 조회 대상 groupId 가 있는 경우
    if (groupId) {
      const groupIds = (
        await this.groupsDomainService.findGroupAndDescendantsByIds(church, [
          groupId,
        ])
      ).map((group) => group.id);

      return new WorshipGroupIdsVo(groupIds, false);
    } else if (Number.isNaN(groupId)) {
      return new WorshipGroupIdsVo([], false);
    } else {
      // 조회 대상 groupId 가 없을 경우
      // 기본 예배 대상 그룹
      return defaultWorshipGroupIds;
    }
  }

  /**
   * 예배 세션 수정
   * @param church
   * @param worshipId
   * @param sessionId
   * @param dto
   * @param qr
   */
  async patchWorshipSessionById(
    church: ChurchModel,
    worshipId: number,
    sessionId: number,
    dto: UpdateWorshipSessionDto,
    qr: QueryRunner,
  ) {
    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );

    const targetSession =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
        qr,
      );

    const inCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerByMemberId(
          church,
          dto.inChargeId,
          qr,
        )
      : null;

    await this.worshipSessionDomainService.updateWorshipSession(
      targetSession,
      inCharge,
      dto,
      qr,
    );

    const updatedSession =
      await this.worshipSessionDomainService.findWorshipSessionById(
        worship,
        targetSession.id,
        qr,
      );

    return new PatchWorshipSessionResponseDto(updatedSession);
  }

  async deleteWorshipSessionById(
    church: ChurchModel,
    worshipId: number,
    sessionId: number,
    qr: QueryRunner,
  ) {
    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );

    const targetWorshipSession =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
        qr,
      );

    await this.worshipSessionDomainService.deleteWorshipSession(
      targetWorshipSession,
      qr,
    );

    await this.worshipAttendanceDomainService.deleteAttendanceCascadeSession(
      targetWorshipSession,
      qr,
    );

    return new DeleteWorshipSessionResponseDto(
      new Date(),
      targetWorshipSession.id,
      true,
    );
  }

  /**
   * @deprecated
   * @param churchId
   * @param worshipId
   * @param dto
   */
  /*async postWorshipSessionManual(
    churchId: number,
    worshipId: number,
    dto: CreateWorshipSessionDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
    );

    const zonedSessionDate = toZonedTime(dto.sessionDateUtc, TIME_ZONE.SEOUL);

    if (zonedSessionDate.getDay() !== worship.worshipDay) {
      throw new ConflictException(WorshipSessionException.INVALID_SESSION_DAY);
    }

    const inCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerByMemberId(
          church,
          dto.inChargeId,
        )
      : null;

    const newSession =
      await this.worshipSessionDomainService.createWorshipSession(
        worship,
        inCharge,
        dto,
      );

    return new PostWorshipSessionResponseDto(newSession);
  }*/

  /**
   * 가장 최근의 예배 세션 조회 or 생성
   * @deprecated
   * @param churchId
   * @param worshipId
   * @param qr
   */
  /*async getOrPostRecentSession(
    churchId: number,
    worshipId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );

    const recentSessionDate: Date = getRecentSessionDate(
      worship,
      TIME_ZONE.SEOUL,
    );

    const recentSession =
      await this.worshipSessionDomainService.findOrCreateWorshipSession(
        worship,
        recentSessionDate,
        qr,
      );

    if (recentSession.isCreated) {
      const enrollments =
        await this.worshipEnrollmentDomainService.findAllEnrollments(
          worship,
          qr,
        );

      await this.worshipAttendanceDomainService.refreshAttendances(
        recentSession,
        enrollments,
        qr,
      );
    }

    const responseSession =
      await this.worshipSessionDomainService.findWorshipSessionById(
        worship,
        recentSession.id,
        qr,
      );

    return new GetWorshipSessionResponseDto(responseSession);
  }*/
}
