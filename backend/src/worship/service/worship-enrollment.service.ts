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

  private async getGroupIds(
    church: ChurchModel,
    dto: GetWorshipEnrollmentsDto,
    qr?: QueryRunner,
  ) {
    if (!dto.groupId) {
      return;
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

  async getEnrollments(
    //churchId: number,
    //worshipId: number,
    church: ChurchModel,
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    qr?: QueryRunner,
  ) {
    /*const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );*/

    const groupIds = await this.getGroupIds(church, dto, qr);

    const { data, totalCount } =
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
        dto.fromSessionDate,
        dto.toSessionDate,
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
