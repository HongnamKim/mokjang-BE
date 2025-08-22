import { Inject, Injectable } from '@nestjs/common';
import {
  IWORSHIP_ATTENDANCE_DOMAIN_SERVICE,
  IWorshipAttendanceDomainService,
} from '../worship-domain/interface/worship-attendance-domain.service.interface';
import { GetWorshipAttendancesDto } from '../dto/request/worship-attendance/get-worship-attendances.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import {
  IWORSHIP_SESSION_DOMAIN_SERVICE,
  IWorshipSessionDomainService,
} from '../worship-domain/interface/worship-session-domain.service.interface';
import { WorshipAttendancePaginationResponseDto } from '../dto/response/worship-attendance/worship-attendance-pagination-response.dto';
import { QueryRunner } from 'typeorm';
import {
  IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
  IWorshipEnrollmentDomainService,
} from '../worship-domain/interface/worship-enrollment-domain.service.interface';
import { WorshipEnrollmentModel } from '../entity/worship-enrollment.entity';
import { UpdateWorshipAttendanceDto } from '../dto/request/worship-attendance/update-worship-attendance.dto';
import { WorshipAttendanceModel } from '../entity/worship-attendance.entity';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { WorshipModel } from '../entity/worship.entity';
import { GetWorshipAttendanceListDto } from '../dto/request/worship-attendance/get-worship-attendance-list.dto';
import { getIntersectionGroupIds } from '../utils/worship-utils';
import { WorshipAttendanceListResponseDto } from '../dto/response/worship-attendance/worship-attendance-list-response.dto';
import { PatchWorshipAllAttendedResponseDto } from '../dto/response/worship-attendance/patch-worship-all-attended-response.dto';

@Injectable()
export class WorshipAttendanceService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IWORSHIP_SESSION_DOMAIN_SERVICE)
    private readonly worshipSessionDomainService: IWorshipSessionDomainService,
    @Inject(IWORSHIP_ENROLLMENT_DOMAIN_SERVICE)
    private readonly worshipEnrollmentDomainService: IWorshipEnrollmentDomainService,

    @Inject(IWORSHIP_ATTENDANCE_DOMAIN_SERVICE)
    private readonly worshipAttendanceDomainService: IWorshipAttendanceDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  async getAttendances(
    church: ChurchModel,
    worship: WorshipModel,
    sessionId: number,
    dto: GetWorshipAttendancesDto,
    defaultTargetGroupIds: number[] | undefined,
    permissionScopeGroupIds: number[] | undefined,
  ) {
    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
      );

    // 요청한 그룹 or 예배 대상 그룹
    const requestGroupIds = await this.getRequestGroupIds(
      church,
      defaultTargetGroupIds,
      dto.groupId,
    );

    // 예배 대상 그룹 * 권한 범위의 교집합
    const intersectionGroupIds = getIntersectionGroupIds(
      requestGroupIds,
      permissionScopeGroupIds,
    );

    const { data, totalCount } =
      await this.worshipAttendanceDomainService.findAttendances(
        session,
        dto,
        intersectionGroupIds,
      );

    return new WorshipAttendancePaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getAttendancesV2(
    church: ChurchModel,
    worship: WorshipModel,
    sessionId: number,
    query: GetWorshipAttendanceListDto,
    defaultTargetGroupIds: number[] | undefined,
    permissionScopeGroupIds: number[] | undefined,
  ) {
    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
      );

    const requestGroupIds = await this.getRequestGroupIds(
      church,
      defaultTargetGroupIds,
      query.groupId,
    );

    const intersectionGroupIds = getIntersectionGroupIds(
      requestGroupIds,
      permissionScopeGroupIds,
    );

    const result = await this.worshipAttendanceDomainService.findAttendanceList(
      session,
      query,
      intersectionGroupIds,
    );

    return new WorshipAttendanceListResponseDto(
      result.items,
      result.items.length,
      result.nextCursor,
      result.hasMore,
    );
  }

  async refreshAttendance(
    churchId: number,
    worshipId: number,
    sessionId: number,
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

    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
        qr,
      );

    const allEnrollments =
      await this.worshipEnrollmentDomainService.findAllEnrollments(worship, qr);

    const existWorshipAttendances =
      await this.worshipAttendanceDomainService.findAllAttendances(session, qr);

    const existWorshipAttendanceEnrollmentIds = new Set(
      existWorshipAttendances.map((attendance) => attendance.id),
    );

    const notExistAttendanceEnrollments: WorshipEnrollmentModel[] = [];

    for (const enrollment of allEnrollments) {
      if (!existWorshipAttendanceEnrollmentIds.has(enrollment.id)) {
        notExistAttendanceEnrollments.push(enrollment);
      }
    }

    const result = await this.worshipAttendanceDomainService.refreshAttendances(
      session,
      notExistAttendanceEnrollments,
      qr,
    );

    return { createdCount: result.length, timestamp: new Date() };
  }

  async patchAttendance(
    churchId: number,
    worshipId: number,
    sessionId: number,
    attendanceId: number,
    dto: UpdateWorshipAttendanceDto,
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
    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
        qr,
      );

    const targetAttendance =
      await this.worshipAttendanceDomainService.findWorshipAttendanceModelById(
        session,
        attendanceId,
        qr,
        { worshipEnrollment: true },
      );

    await this.updatePresentAbsentCount(
      targetAttendance,
      targetAttendance.worshipEnrollment,
      dto,
      qr,
    );

    await this.worshipAttendanceDomainService.updateAttendance(
      targetAttendance,
      dto,
      qr,
    );

    return await this.worshipAttendanceDomainService.findWorshipAttendanceById(
      session,
      attendanceId,
      qr,
    );
  }

  private async updatePresentAbsentCount(
    targetAttendance: WorshipAttendanceModel,
    enrollment: WorshipEnrollmentModel,
    dto: UpdateWorshipAttendanceDto,
    qr: QueryRunner,
  ) {
    if (!dto.attendanceStatus) {
      return;
    }

    const transition =
      `${targetAttendance.attendanceStatus}->${dto.attendanceStatus}` as const;

    const mutations: Record<
      string,
      { inc?: 'present' | 'absent'; dec?: 'present' | 'absent' }
    > = {
      // UNKNOWN -> PRESENT or ABSENT
      'unknown->present': { inc: 'present' },
      'unknown->absent': { inc: 'absent' },

      // PRESENT -> UNKNOWN or PRESENT
      'present->unknown': { dec: 'present' },
      'present->absent': { dec: 'present', inc: 'absent' },

      // ABSENT -> UNKNOWN or PRESENT
      'absent->unknown': { dec: 'absent' },
      'absent->present': { dec: 'absent', inc: 'present' },
    };

    const mutation = mutations[transition];

    if (mutation?.inc === 'present') {
      await this.worshipEnrollmentDomainService.incrementPresentCount(
        enrollment,
        qr,
      );
    }

    if (mutation?.inc === 'absent') {
      await this.worshipEnrollmentDomainService.incrementAbsentCount(
        enrollment,
        qr,
      );
    }

    if (mutation?.dec === 'present') {
      await this.worshipEnrollmentDomainService.decrementPresentCount(
        enrollment,
        qr,
      );
    }

    if (mutation?.dec === 'absent') {
      await this.worshipEnrollmentDomainService.decrementAbsentCount(
        enrollment,
        qr,
      );
    }
  }

  private async getRequestGroupIds(
    church: ChurchModel,
    defaultTargetGroupIds: number[] | undefined,
    groupId?: number,
  ) {
    if (groupId) {
      return (
        await this.groupsDomainService.findGroupAndDescendantsByIds(church, [
          groupId,
        ])
      ).map((group) => group.id);
    } else {
      return defaultTargetGroupIds;
    }
  }

  async patchAllAttended(
    church: ChurchModel,
    worship: WorshipModel,
    sessionId: number,
    defaultTargetGroupIds: number[] | undefined,
    permissionScopeGroupIds: number[] | undefined,
    qr: QueryRunner,
  ) {
    const requestGroupIds = await this.getRequestGroupIds(
      church,
      defaultTargetGroupIds,
    );

    const intersectionGroupIds = getIntersectionGroupIds(
      requestGroupIds,
      permissionScopeGroupIds,
    );

    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
        qr,
      );

    const unknownAttendances =
      await this.worshipAttendanceDomainService.findUnknownAttendances(
        session,
        intersectionGroupIds,
        qr,
      );

    const absentAttendance =
      await this.worshipAttendanceDomainService.findAbsentAttendances(
        session,
        intersectionGroupIds,
        qr,
      );

    const updateTargetIds = [...unknownAttendances, ...absentAttendance].map(
      (attendance) => attendance.id,
    );

    if (updateTargetIds.length === 0) {
      return new PatchWorshipAllAttendedResponseDto(
        true,
        updateTargetIds.length,
      );
    }

    await this.worshipAttendanceDomainService.updateAllAttended(
      updateTargetIds,
      qr,
    );

    await this.worshipEnrollmentDomainService.incrementPresentCounts(
      [...unknownAttendances, ...absentAttendance],
      qr,
    );
    await this.worshipEnrollmentDomainService.decrementAbsentCounts(
      absentAttendance,
      qr,
    );

    return new PatchWorshipAllAttendedResponseDto(true, updateTargetIds.length);
  }
}
