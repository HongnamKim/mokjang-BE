import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SessionAttendanceModel } from '../entity/session-attendance.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { GetAttendanceDto } from '../dto/request/get-attendance.dto';
import {
  ISESSION_ATTENDANCE_DOMAIN_SERVICE,
  ISessionAttendanceDomainService,
} from '../../education-domain/interface/session-attendance-domain.service.interface';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from '../../education-domain/interface/education-domain.service.interface';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from '../../education-domain/interface/education-term-domain.service.interface';
import {
  IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
  IEducationEnrollmentsDomainService,
} from '../../education-domain/interface/education-enrollment-domain.service.interface';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from '../../education-domain/interface/education-session-domain.service.interface';
import { SessionAttendancePaginationResponseDto } from '../dto/response/session-attendance-pagination-response.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import { UpdateAttendanceNoteDto } from '../dto/request/update-attendance-note.dto';
import { PatchSessionAttendanceResponseDto } from '../dto/response/patch-session-attendance-response.dto';
import { UpdateAttendancePresentDto } from '../dto/request/update-attendance-present.dto';
import { SessionAttendanceException } from '../exception/session-attendance.exception';
import { SessionAttendanceStatus } from '../const/session-attendance-status.enum';

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

    const data =
      await this.sessionAttendanceDomainService.findSessionAttendances(
        educationSession,
        dto,
      );

    return new SessionAttendancePaginationResponseDto(data);
  }

  async bulkAttendance(
    churchId: number,
    educationId: number,
    educationTermId: number,
    sessionId: number,
    qr: QueryRunner,
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
        education,
        educationTermId,
        qr,
      );
    const educationSession =
      await this.educationSessionDomainService.findEducationSessionModelById(
        educationTerm,
        sessionId,
        qr,
      );

    const unattended = await this.sessionAttendanceDomainService.findUnAttended(
      educationSession,
      qr,
    );

    const unattendedEnrollmentIds = unattended.map(
      (u) => u.educationEnrollmentId,
    );

    const unattendedEnrollments =
      await this.educationEnrollmentDomainService.findEducationEnrollmentsByIds(
        educationTerm,
        unattendedEnrollmentIds,
        qr,
      );

    if (unattended.length === 0) {
      return;
    }

    // 일괄 출석 처리
    await this.sessionAttendanceDomainService.bulkAttendance(unattended, qr);

    // 각 Enrollment 별 출석 수 증가
    await this.educationEnrollmentDomainService.bulkIncrementAttendanceCount(
      unattendedEnrollments,
      qr,
    );

    // 출석 교인 수 증가
    await this.educationSessionDomainService.incrementAttendancesCount(
      educationSession,
      unattended.length,
      qr,
    );

    return {
      affectedCount: unattended.length,
      timestamp: new Date(),
    };
  }

  async updateSessionAttendancePresent(
    churchId: number,
    educationId: number,
    educationTermId: number,
    sessionId: number,
    attendanceId: number,
    dto: UpdateAttendancePresentDto,
    qr: QueryRunner,
  ) {
    const { educationSession } = await this.getEducationInfo(
      churchId,
      educationId,
      educationTermId,
      sessionId,
      qr,
    );

    const targetAttendance =
      await this.sessionAttendanceDomainService.findSessionAttendanceModelById(
        educationSession,
        attendanceId,
        qr,
      );

    if (dto.status === SessionAttendanceStatus.NONE) {
      throw new BadRequestException();
    }

    if (dto.status === targetAttendance.status) {
      throw new BadRequestException(SessionAttendanceException.SAME_STATUS);
    }

    const enrollment =
      await this.educationEnrollmentDomainService.findEducationEnrollmentModelById(
        targetAttendance.educationEnrollmentId,
        qr,
      );

    // 출석으로 변경
    if (dto.status === SessionAttendanceStatus.PRESENT) {
      await this.educationSessionDomainService.incrementAttendancesCount(
        educationSession,
        1,
        qr,
      );
      await this.educationEnrollmentDomainService.incrementAttendanceCount(
        enrollment,
        qr,
      );
    } else {
      // 결석으로 변경
      if (targetAttendance.status === SessionAttendanceStatus.PRESENT) {
        // 기존 출석을 결석으로 변경 --> 증가 했던 출석 수들을 감소
        await this.educationSessionDomainService.decrementAttendancesCount(
          educationSession,
          1,
          qr,
        );
        await this.educationEnrollmentDomainService.decrementAttendanceCount(
          enrollment,
          qr,
        );
      }
    }

    await this.sessionAttendanceDomainService.updateSessionAttendance(
      targetAttendance,
      dto,
      qr,
    );

    // 변경 사항 적용
    targetAttendance.status = dto.status;

    return new PatchSessionAttendanceResponseDto(targetAttendance);
  }

  async updateSessionAttendanceNote(
    churchId: number,
    educationId: number,
    educationTermId: number,
    sessionId: number,
    attendanceId: number,
    dto: UpdateAttendanceNoteDto,
  ) {
    const targetAttendance = await this.getSessionAttendanceModelById(
      churchId,
      educationId,
      educationTermId,
      sessionId,
      attendanceId,
    );

    if (targetAttendance.note === dto.note) {
      return new PatchSessionAttendanceResponseDto(targetAttendance);
    }

    await this.sessionAttendanceDomainService.updateSessionAttendance(
      targetAttendance,
      dto,
    );

    targetAttendance.note = dto.note;

    return new PatchSessionAttendanceResponseDto(targetAttendance);
  }

  /*async updateSessionAttendance(
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

    /!**
     * 업데이트 대상
     *  1. 출석 --> sessionAttendance, educationEnrollment 수정
     *  2. 비고 --> sessionAttendance 만 수정
     *!/

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
      dto.attendanceStatus !== undefined &&
      dto.attendanceStatus !== sessionAttendance.status
    ) {
      const { educationSession } = await this.getEducationInfo(
        churchId,
        educationId,
        educationTermId,
        educationSessionId,
        qr,
      );

      if (dto.attendanceStatus) {
        await this.educationEnrollmentDomainService.incrementAttendanceCount(
          sessionAttendance.educationEnrollment,
          qr,
        );

        await this.educationSessionDomainService.incrementAttendancesCount(
          educationSession,
          1,
          qr,
        );
      } else {
        // 출석이었던 정보를 결석으로 수정 시
        await this.educationEnrollmentDomainService.decrementAttendanceCount(
          sessionAttendance.educationEnrollment,
          qr,
        );

        // 세션의 출석수 감소
        await this.educationSessionDomainService.decrementAttendancesCount(
          educationSession,
          1,
          qr,
        );
      }
    }

    return this.sessionAttendanceDomainService.findSessionAttendanceModelById(
      sessionAttendance.educationSession,
      sessionAttendanceId,
      qr,
    );
  }*/
}
