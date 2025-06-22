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

@Injectable()
export class WorshipEnrollmentService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IWORSHIP_ENROLLMENT_DOMAIN_SERVICE)
    private readonly worshipEnrollmentDomainService: IWorshipEnrollmentDomainService,
    @Inject(IWORSHIP_ATTENDANCE_DOMAIN_SERVICE)
    private readonly worshipAttendanceDomainService: IWorshipAttendanceDomainService,
  ) {}

  async getEnrollments(
    churchId: number,
    worshipId: number,
    dto: GetWorshipEnrollmentsDto,
    qr?: QueryRunner,
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

    const { data, totalCount } =
      await this.worshipEnrollmentDomainService.findEnrollments(
        worship,
        dto,
        qr,
      );

    const attendances = await Promise.all(
      data.map(async (enrollment) =>
        this.worshipAttendanceDomainService.joinAttendance(
          enrollment,
          dto.fromSessionDate,
          dto.toSessionDate,
          qr,
        ),
      ),
    );

    data.forEach((enrollment, index) => {
      enrollment.worshipAttendances = attendances[index];
    });

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
