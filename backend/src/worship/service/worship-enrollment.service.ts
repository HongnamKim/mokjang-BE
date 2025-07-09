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
import { QueryRunner } from 'typeorm';
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

@Injectable()
export class WorshipEnrollmentService {
  constructor(
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

  private async getRequestGroupIds(
    church: ChurchModel,
    dto: GetWorshipEnrollmentsDto,
    qr?: QueryRunner,
  ): Promise<number[] | undefined> {
    if (!dto.groupId) {
      return undefined;
    }

    const group = await this.groupsDomainService.findGroupModelById(
      church,
      dto.groupId,
      qr,
    );

    const groupIds = (
      await this.groupsDomainService.findChildGroups(group, qr)
    ).map((group) => group.id);

    groupIds && groupIds.unshift(group.id);

    return groupIds;
  }

  private async getDefaultGroupIds(
    church: ChurchModel,
    worship: WorshipModel,
    qr?: QueryRunner,
  ) {
    const rootTargetGroupIds = worship.worshipTargetGroups.map(
      (group) => group.group.id,
    );

    const defaultGroupIds = (
      await this.groupsDomainService.findGroupAndDescendantsByIds(
        church,
        rootTargetGroupIds,
        qr,
      )
    ).map((group) => group.id);

    if (defaultGroupIds.length) {
      return defaultGroupIds;
    } else {
      return undefined;
    }
  }

  private intersection(
    defaultWorshipTargetGroupIds?: number[],
    permissionScopeGroupIds?: number[],
  ) {
    /*
    2. 예배 범위가 전체인 경우
    --> defaultWorshipTargetGroup 이 빈 배열 []
      case 1. 권한 범위가 정해져있는 경우
      --> permissionScopeGroupIds 로 조회
      case 2. 권한 범위가 전체인 경우
      --> 그룹 조건 없이 모두 조회
    */
    if (!defaultWorshipTargetGroupIds) {
      return permissionScopeGroupIds;
    }

    /*
    3. 예배 범위가 정해진 경우
      case 1. 권한 범위가 정해져 있는 경우
      --> defaultWorshipTargetGroup 과 permissionScopeGroupIds 의 교집합으로 조회
      case 2. 권한 범위가 전체인 경우
      --> permissionScopeGroupIds 가 undefined
      --> defaultWorshipTargetGroup 으로 조회
     */
    if (!permissionScopeGroupIds) {
      return defaultWorshipTargetGroupIds;
    }

    const targetGroupIdSet = new Set(defaultWorshipTargetGroupIds);

    return permissionScopeGroupIds.filter((scopeGroupId) =>
      targetGroupIdSet.has(scopeGroupId),
    );
  }

  async getEnrollments(
    church: ChurchModel,
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    permissionScopeGroupIds?: number[],
    qr?: QueryRunner,
  ) {
    // 조회 요청 groupId, 가드에서 검증 완료
    /*
    1. 요청에서 groupId 를 특정하는 경우
       -> 가드에서 예배 범위, 사용자의 권한 체크
       -> 그대로 보여줌
     */
    const requestGroupIds = await this.getRequestGroupIds(church, dto, qr);

    const defaultWorshipTargetGroup = await this.getDefaultGroupIds(
      church,
      worship,
      qr,
    );

    const groupIds = requestGroupIds
      ? requestGroupIds
      : this.intersection(defaultWorshipTargetGroup, permissionScopeGroupIds);

    const { data, totalCount } =
      await this.worshipEnrollmentDomainService.findEnrollmentsByQueryBuilder(
        worship,
        dto,
        groupIds,
      );

    const enrollmentIds = data.map(
      (enrollment: WorshipEnrollmentModel) => enrollment.id,
    );

    /*if (dto.fromSessionDate && !dto.toSessionDate) {
      dto.toSessionDate = new Date(
        dto.fromSessionDate.getTime() + 100 * 24 * 60 * 60 * 1000,
      );
    }

    if (!dto.fromSessionDate && dto.toSessionDate) {
      dto.fromSessionDate = new Date(
        dto.toSessionDate.getTime() - 100 * 24 * 60 * 60 * 1000,
      );
    }*/

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

    return new WorshipEnrollmentPaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
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
}
