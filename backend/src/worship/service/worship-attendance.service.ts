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
  ) {}

  async getAttendances(
    churchId: number,
    worshipId: number,
    sessionId: number,
    dto: GetWorshipAttendancesDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
    );

    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
      );

    const { data, totalCount } =
      await this.worshipAttendanceDomainService.findAttendances(session, dto);

    return new WorshipAttendancePaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
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
}
