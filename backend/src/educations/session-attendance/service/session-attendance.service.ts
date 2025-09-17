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
import { UpdateAttendanceNoteDto } from '../dto/request/update-attendance-note.dto';
import { PatchSessionAttendanceResponseDto } from '../dto/response/patch-session-attendance-response.dto';
import { UpdateAttendancePresentDto } from '../dto/request/update-attendance-present.dto';
import { SessionAttendanceException } from '../exception/session-attendance.exception';
import { SessionAttendanceStatus } from '../const/session-attendance-status.enum';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import {
  IMEMBER_FILTER_SERVICE,
  IMemberFilterService,
} from '../../../members/service/interface/member-filter.service.interface';
import { MemberFilterService } from '../../../members/service/member-filter.service';

@Injectable()
export class SessionAttendanceService {
  constructor(
    @Inject(IMEMBER_FILTER_SERVICE)
    private readonly memberFilterService: IMemberFilterService,

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
    church: ChurchModel,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    sessionAttendanceId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SessionAttendanceModel>,
  ) {
    const { educationSession } = await this.getEducationInfo(
      church,
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
    church: ChurchModel,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr?: QueryRunner,
  ) {
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
    church: ChurchModel,
    requestManager: ChurchUserModel,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    dto: GetAttendanceDto,
  ) {
    const { educationSession } = await this.getEducationInfo(
      church,
      educationId,
      educationTermId,
      educationSessionId,
    );

    const data =
      await this.sessionAttendanceDomainService.findSessionAttendances(
        educationSession,
        dto,
      );

    const scope = await this.memberFilterService.getScopeGroupIds(
      church,
      requestManager,
    );

    const members = data.map(
      (attendance) => attendance.educationEnrollment.member,
    );

    const filteredMembers = this.memberFilterService.filterMembers(
      requestManager,
      members,
      scope,
    );

    data.forEach((attendance) => {
      const filteredMember = filteredMembers.find(
        (m) => m.id === attendance.educationEnrollment.memberId,
      );

      if (filteredMember) {
        attendance.educationEnrollment.member = filteredMember;
      } else {
        attendance.educationEnrollment.member.mobilePhone =
          MemberFilterService.MASKING_TEXT;
      }
    });

    return new SessionAttendancePaginationResponseDto(data);
  }

  async bulkAttendance(
    church: ChurchModel,
    educationId: number,
    educationTermId: number,
    sessionId: number,
    qr: QueryRunner,
  ) {
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
    church: ChurchModel,
    educationId: number,
    educationTermId: number,
    sessionId: number,
    attendanceId: number,
    dto: UpdateAttendancePresentDto,
    qr: QueryRunner,
  ) {
    const { educationSession } = await this.getEducationInfo(
      church,
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
    church: ChurchModel,
    educationId: number,
    educationTermId: number,
    sessionId: number,
    attendanceId: number,
    dto: UpdateAttendanceNoteDto,
  ) {
    const targetAttendance = await this.getSessionAttendanceModelById(
      church,
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
}
