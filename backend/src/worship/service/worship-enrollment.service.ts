import { Inject, Injectable } from '@nestjs/common';
import {
  IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
  IWorshipEnrollmentDomainService,
} from '../worship-domain/interface/worship-enrollment-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import { DataSource, QueryRunner } from 'typeorm';
import { GetWorshipEnrollmentsDto } from '../dto/request/worship-enrollment/get-worship-enrollments.dto';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { MemberModel } from '../../members/entity/member.entity';
import { WorshipEnrollmentPaginationResponseDto } from '../dto/response/worship-enrollment/worship-enrollment-pagination-response.dto';
import {
  IWORSHIP_ATTENDANCE_DOMAIN_SERVICE,
  IWorshipAttendanceDomainService,
} from '../worship-domain/interface/worship-attendance-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../../management/groups/groups-domain/interface/groups-domain.service.interface';
import { WorshipEnrollmentModel } from '../entity/worship-enrollment.entity';
import { WorshipAttendanceModel } from '../entity/worship-attendance.entity';
import { WorshipModel } from '../entity/worship.entity';
import { getIntersection } from '../utils/worship-utils';
import { OnEvent } from '@nestjs/event-emitter';
import { MemberDeletedEvent } from '../../members/events/member.event';
import { WorshipGroupIdsVo } from '../vo/worship-group-ids.vo';
import { PermissionScopeIdsVo } from '../../permission/vo/permission-scope-ids.vo';

@Injectable()
export class WorshipEnrollmentService {
  constructor(
    private readonly dataSource: DataSource,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,

    @Inject(IWORSHIP_ENROLLMENT_DOMAIN_SERVICE)
    private readonly worshipEnrollmentDomainService: IWorshipEnrollmentDomainService,
    @Inject(IWORSHIP_ATTENDANCE_DOMAIN_SERVICE)
    private readonly worshipAttendanceDomainService: IWorshipAttendanceDomainService,
  ) {}

  /**
   * 필터링 그룹이 있을 경우 해당 그룹과 그 하위를 반환
   * 필터링 그룹이 없을 경우 예배 대상 그룹과 그 하위를 반환
   * @param church
   * @param defaultWorshipGroupIds
   * @param groupId
   * @private
   */
  private async getRequestGroupIds(
    church: ChurchModel,
    defaultWorshipGroupIds: WorshipGroupIdsVo,
    groupId?: number,
  ) {
    // 특정 그룹 필터링
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
      return defaultWorshipGroupIds;
    }
  }

  async getEnrollments(
    church: ChurchModel,
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    permissionScopeIds: PermissionScopeIdsVo, // 요청자의 권한 범위
    defaultTargetGroupIds: WorshipGroupIdsVo, // 예배 대상 그룹
    qr?: QueryRunner,
  ) {
    const requestGroupIds = await this.getRequestGroupIds(
      church,
      defaultTargetGroupIds,
      dto.groupId,
    );

    // 조회 그룹과 요청자 권한 범위의 교집합
    const groupIds = getIntersection(requestGroupIds, permissionScopeIds);

    if (groupIds.groupIds.length === 0 && !permissionScopeIds.isAllGroups) {
      // 현재 권한에서 조회할 수 있는 그룹이 없는 경우
      return new WorshipEnrollmentPaginationResponseDto([]);
    }

    const data =
      await this.worshipEnrollmentDomainService.findEnrollmentsByQueryBuilder(
        worship,
        dto,
        groupIds,
      );

    const enrollmentIds = data.map(
      (enrollment: WorshipEnrollmentModel) => enrollment.id,
    );

    const attendances =
      await this.worshipAttendanceDomainService.joinAttendance(
        enrollmentIds,
        dto.fromSessionDateUtc,
        dto.toSessionDateUtc,
        qr,
      );

    const attendanceMap = new Map<number, WorshipAttendanceModel[]>();

    for (const att of attendances) {
      if (!attendanceMap.has(att.worshipEnrollmentId)) {
        attendanceMap.set(att.worshipEnrollmentId, [att]);
      } else {
        attendanceMap.get(att.worshipEnrollmentId)?.push(att);
      }
    }

    for (const enrollment of data) {
      enrollment.worshipAttendances = attendanceMap.get(enrollment.id) ?? [];
    }

    return new WorshipEnrollmentPaginationResponseDto(data);
  }

  async refreshEnrollment(
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

    const allMembers = await this.membersDomainService.findAllMembers(
      church,
      qr,
    );

    const existWorshipEnrollments =
      await this.worshipEnrollmentDomainService.findAllEnrollments(worship, qr);

    const existEnrollmentMemberIds = new Set(
      existWorshipEnrollments.map((enrollment) => enrollment.memberId),
    );

    const notExistEnrollmentMembers: MemberModel[] = [];

    for (const member of allMembers) {
      if (!existEnrollmentMemberIds.has(member.id)) {
        notExistEnrollmentMembers.push(member);
      }
    }

    const result = await this.worshipEnrollmentDomainService.refreshEnrollments(
      worship,
      notExistEnrollmentMembers,
      qr,
    );

    return { createdCount: result.length, timestamp: new Date() };
  }

  @OnEvent('member.deleted')
  async handleMemberDeleted(event: MemberDeletedEvent) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const targetEnrollments =
        await this.worshipEnrollmentDomainService.findEnrollmentsByMemberId(
          event.memberId,
        );

      await this.worshipAttendanceDomainService.deleteAttendanceCascadeEnrollment(
        targetEnrollments,
      );

      await qr.commitTransaction();
    } catch {
      await qr.rollbackTransaction();
    } finally {
      await qr.release();
    }
  }
}
