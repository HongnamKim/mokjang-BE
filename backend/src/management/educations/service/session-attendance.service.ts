import { Inject, Injectable } from '@nestjs/common';
import { SessionAttendanceModel } from '../entity/session-attendance.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { GetAttendanceDto } from '../dto/attendance/get-attendance.dto';
import { UpdateAttendanceDto } from '../dto/attendance/update-attendance.dto';
import {
  ISESSION_ATTENDANCE_DOMAIN_SERVICE,
  ISessionAttendanceDomainService,
} from './education-domain/interface/session-attendance-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from './education-domain/interface/education-domain.service.interface';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from './education-domain/interface/education-term-domain.service.interface';
import {
  IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
  IEducationEnrollmentsDomainService,
} from './education-domain/interface/education-enrollment-domain.service.interface';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from './education-domain/interface/education-session-domain.service.interface';

@Injectable()
export class SessionAttendanceService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IEDUCATION_DOMAIN_SERVICE)
    private readonly educationDomainService: IEducationDomainService,
    @Inject(IEDUCATION_TERM_DOMAIN_SERVICE)
    private readonly educationTermDomainService: IEducationTermDomainService,
    @Inject(IEDUCATION_ENROLLMENT_DOMAIN_SERVICE)
    private readonly educationEnrollmentDomainService: IEducationEnrollmentsDomainService,
    @Inject(IEDUCATION_SESSION_DOMAIN_SERVICE)
    private readonly educationSessionDomainService: IEducationSessionDomainService,
    @Inject(ISESSION_ATTENDANCE_DOMAIN_SERVICE)
    private readonly sessionAttendanceDomainService: ISessionAttendanceDomainService,
  ) {}

  private async getSessionAttendanceModelById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    sessionAttendanceId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SessionAttendanceModel>,
  ) {
    const { educationSession } = await this.getEducationInfo(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      qr,
    );

    return this.sessionAttendanceDomainService.findSessionAttendanceModelById(
      educationSession,
      sessionAttendanceId,
      qr,
      relationOptions,
    );
  }

  private async getEducationInfo(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    const educationTerm =
      await this.educationTermDomainService.findEducationTermModelById(
        church,
        education,
        educationTermId,
        qr,
      );

    const educationSession =
      await this.educationSessionDomainService.findEducationSessionById(
        educationTerm,
        educationSessionId,
        qr,
      );

    return {
      church,
      education,
      educationTerm,
      educationSession,
    };
  }

  async getSessionAttendance(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    dto: GetAttendanceDto,
  ) {
    const { educationSession } = await this.getEducationInfo(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
    );

    return this.sessionAttendanceDomainService.findSessionAttendances(
      educationSession,
      dto,
    );
  }

  async updateSessionAttendance(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    sessionAttendanceId: number,
    dto: UpdateAttendanceDto,
    qr: QueryRunner,
  ) {
    // 출석 업데이트 시 Enrollment 의 출석 횟수 변경
    // sessionAttendance, educationEnrollment 필요

    /**
     * 업데이트 대상
     *  1. 출석 --> sessionAttendance, educationEnrollment 수정
     *  2. 비고 --> sessionAttendance 만 수정
     */

    const sessionAttendance = await this.getSessionAttendanceModelById(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      sessionAttendanceId,
      qr,
      { educationEnrollment: true, educationSession: true },
    );

    await this.sessionAttendanceDomainService.updateSessionAttendance(
      sessionAttendance,
      dto,
      qr,
    );

    // 출석 정보 업데이트 시
    // isPresent 가 boolean 이기 때문에 undefined 로 판단
    if (
      dto.isPresent !== undefined &&
      dto.isPresent !== sessionAttendance.isPresent
    ) {
      if (dto.isPresent) {
        await this.educationEnrollmentDomainService.incrementAttendanceCount(
          sessionAttendance.educationEnrollment,
          qr,
        );
      } else {
        await this.educationEnrollmentDomainService.decrementAttendanceCount(
          sessionAttendance.educationEnrollment,
          qr,
        );
      }
    }

    return this.sessionAttendanceDomainService.findSessionAttendanceModelById(
      sessionAttendance.educationSession,
      sessionAttendanceId,
      qr,
    );
  }
}
