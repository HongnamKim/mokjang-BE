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
import { getIntersectionGroupIds } from '../utils/worship-utils';
import { OnEvent } from '@nestjs/event-emitter';
import { MemberDeletedEvent } from '../../members/events/member.event';

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
   * @param defaultTargetGroupIds
   * @param groupId
   * @private
   */
  private async getRequestGroupIds(
    church: ChurchModel,
    defaultTargetGroupIds: number[],
    groupId?: number,
  ): Promise<number[]> {
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

  async getEnrollments(
    church: ChurchModel,
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    permissionScopeGroupIds: number[], // 요청자의 권한 범위
    defaultTargetGroupIds: number[], // 예배 대상 그룹
    qr?: QueryRunner,
  ) {
    // 조회 요청 groupId, 가드에서 검증 완료
    /*
    1. 요청에서 groupId 를 특정하는 경우
       -> 가드에서 예배 범위, 사용자의 권한 체크
       -> 그대로 보여줌
     */
    const requestGroupIds = await this.getRequestGroupIds(
      church,
      defaultTargetGroupIds,
      dto.groupId,
    );

    // 조회 그룹과 요청자 권한 범위의 교집합
    const groupIds = getIntersectionGroupIds(
      requestGroupIds,
      permissionScopeGroupIds,
    );

    if (groupIds.length === 0) {
      // 현재 권한에서 조회할 수 있는 그룹이 없는 경우
      return new WorshipEnrollmentPaginationResponseDto([]);
    }

    /*const { data, totalCount } =*/
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
