import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { UpdateEducationSessionDto } from '../dto/request/update-education-session.dto';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from '../../education-domain/interface/education-session-domain.service.interface';
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
  ISESSION_ATTENDANCE_DOMAIN_SERVICE,
  ISessionAttendanceDomainService,
} from '../../education-domain/interface/session-attendance-domain.service.interface';
import { CreateEducationSessionDto } from '../dto/request/create-education-session.dto';
import { PostEducationSessionResponseDto } from '../dto/response/post-education-session-response.dto';
import { GetEducationSessionDto } from '../dto/request/get-education-session.dto';
import { EducationSessionPaginationResponseDto } from '../dto/response/education-session-pagination-response.dto';
import { GetEducationSessionResponseDto } from '../dto/response/get-education-session-response.dto';
import { EducationSessionStatus } from '../const/education-session-status.enum';
import { PatchEducationSessionResponseDto } from '../dto/response/patch-education-session-response.dto';
import { DeleteSessionResponseDto } from '../dto/response/delete-education-session-response.dto';
import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import { EducationModel } from '../../education/entity/education.entity';
import { EducationSessionModel } from '../entity/education-session.entity';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../../manager/manager-domain/service/interface/manager-domain.service.interface';
import {
  IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE,
  IEducationSessionReportDomainService,
} from '../../../report/report-domain/interface/education-session-report-domain.service.interface';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { AddEducationSessionReportDto } from '../../../report/dto/education-report/session/request/add-education-session-report.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { DeleteEducationSessionReportDto } from '../../../report/dto/education-report/session/request/delete-education-session-report.dto';
import { EducationSessionException } from '../exception/education-session.exception';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { SessionAttendanceStatus } from '../../session-attendance/const/session-attendance-status.enum';

@Injectable()
export class EducationSessionService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

    @Inject(IEDUCATION_DOMAIN_SERVICE)
    private readonly educationDomainService: IEducationDomainService,
    @Inject(IEDUCATION_TERM_DOMAIN_SERVICE)
    private readonly educationTermDomainService: IEducationTermDomainService,
    @Inject(IEDUCATION_SESSION_DOMAIN_SERVICE)
    private readonly educationSessionDomainService: IEducationSessionDomainService,
    @Inject(IEDUCATION_ENROLLMENT_DOMAIN_SERVICE)
    private readonly educationEnrollmentsDomainService: IEducationEnrollmentsDomainService,
    @Inject(ISESSION_ATTENDANCE_DOMAIN_SERVICE)
    private readonly sessionAttendanceDomainService: ISessionAttendanceDomainService,

    @Inject(IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE)
    private readonly educationSessionReportDomainService: IEducationSessionReportDomainService,
  ) {}

  private async getEducationTerm(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr?: QueryRunner,
  ) {
    const { education } = await this.getEducationInfo(
      churchId,
      educationId,
      qr,
    );

    return this.educationTermDomainService.findEducationTermModelById(
      education,
      educationTermId,
      qr,
    );
  }

  private async getEducationInfo(
    churchId: number,
    educationId: number,
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

    return {
      church,
      education,
    };
  }

  async getEducationSessions(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: GetEducationSessionDto,
  ) {
    const educationTerm = await this.getEducationTerm(
      churchId,
      educationId,
      educationTermId,
    );

    const data = await this.educationSessionDomainService.findEducationSessions(
      educationTerm,
      dto,
    );

    return new EducationSessionPaginationResponseDto(data);
  }

  async getEducationSessionById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr?: QueryRunner,
  ) {
    const educationTerm = await this.getEducationTerm(
      churchId,
      educationId,
      educationTermId,
      qr,
    );

    const session =
      await this.educationSessionDomainService.findEducationSessionById(
        educationTerm,
        educationSessionId,
        qr,
      );

    return new GetEducationSessionResponseDto(session);
  }

  async createEducationSession(
    creatorManager: ChurchUserModel,
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: CreateEducationSessionDto,
    qr: QueryRunner,
  ) {
    const { church, education } = await this.getEducationInfo(
      churchId,
      educationId,
    );

    const educationTerm =
      await this.educationTermDomainService.findEducationTermModelById(
        education,
        educationTermId,
        qr,
      );

    // 기수 당 최대 50개 세션
    if (!educationTerm.canAddSession()) {
      throw new ConflictException(
        EducationSessionException.EXCEED_MAX_SESSION_NUMBER,
      );
    }

    // 세션 담당자
    const inCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerByMemberId(
          church,
          dto.inChargeId,
          qr,
        )
      : null;

    dto.utcStartDate = fromZonedTime(dto.startDate, TIME_ZONE.SEOUL);
    dto.utcEndDate = fromZonedTime(dto.endDate, TIME_ZONE.SEOUL);

    // 세션 생성
    const newSession =
      await this.educationSessionDomainService.createEducationSession(
        educationTerm,
        creatorManager,
        dto,
        inCharge,
        qr,
      );

    // 교육 세션 개수 업데이트
    await this.educationTermDomainService.incrementSessionsCount(
      educationTerm,
      qr,
    );

    // 세션 출석 정보 생성
    if (educationTerm.enrollmentsCount > 0) {
      const enrollments =
        await this.educationEnrollmentsDomainService.findEducationEnrollmentModels(
          educationTerm,
          qr,
        );

      await this.sessionAttendanceDomainService.createSessionAttendance(
        newSession,
        enrollments,
        qr,
      );
    }

    if (dto.receiverIds && dto.receiverIds.length > 0) {
      await this.handleAddEducationReport(
        church,
        education,
        educationTerm,
        newSession,
        dto.receiverIds,
        qr,
      );
    }

    const session =
      await this.educationSessionDomainService.findEducationSessionById(
        educationTerm,
        newSession.id,
        qr,
      );

    return new PostEducationSessionResponseDto(session);
  }

  async updateEducationSession(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    dto: UpdateEducationSessionDto,
    qr: QueryRunner,
  ) {
    const { church, education } = await this.getEducationInfo(
      churchId,
      educationId,
      qr,
    );

    const educationTerm =
      await this.educationTermDomainService.findEducationTermModelById(
        education,
        educationTermId,
        qr,
      );

    const inCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerByMemberId(
          church,
          dto.inChargeId,
          qr,
        )
      : null;

    const targetSession =
      await this.educationSessionDomainService.findEducationSessionModelById(
        educationTerm,
        educationSessionId,
        qr,
      );

    // status 변경으로 EducationTerm 의 완료된 세션 수 업데이트
    if (dto.status && dto.status !== targetSession.status) {
      if (dto.status === EducationSessionStatus.DONE) {
        // status 를 완료로 변경하는 경우
        await this.educationTermDomainService.incrementCompletedSessionsCount(
          educationTerm,
          qr,
        );
      } else if (targetSession.status === EducationSessionStatus.DONE) {
        // status 를 완료 이외의 것으로 변경하지만 기존에 완료였을 경우
        await this.educationTermDomainService.decrementCompletedSessionsCount(
          educationTerm,
          qr,
        );
      }
    }

    dto.utcStartDate =
      dto.startDate && fromZonedTime(dto.startDate, TIME_ZONE.SEOUL);
    dto.utcEndDate = dto.endDate && fromZonedTime(dto.endDate, TIME_ZONE.SEOUL);

    await this.educationSessionDomainService.updateEducationSession(
      targetSession,
      dto,
      inCharge,
      qr,
    );

    const updatedSession =
      await this.educationSessionDomainService.findEducationSessionById(
        educationTerm,
        educationSessionId,
        qr,
      );

    return new PatchEducationSessionResponseDto(updatedSession);
  }

  async deleteEducationSessions(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr: QueryRunner,
  ) {
    const educationTerm = await this.getEducationTerm(
      churchId,
      educationId,
      educationTermId,
      qr,
    );

    const targetSession =
      await this.educationSessionDomainService.findEducationSessionModelById(
        educationTerm,
        educationSessionId,
        qr,
      );

    // 세션 삭제
    await this.educationSessionDomainService.deleteEducationSession(
      targetSession,
      qr,
    );

    // 세션의 보고 삭제
    await this.educationSessionReportDomainService.deleteEducationSessionReportsCascade(
      targetSession,
      qr,
    );

    // 다른 회차들 session 번호 수정
    await this.educationSessionDomainService.reorderSessionsAfterDeletion(
      educationTerm,
      targetSession,
      qr,
    );

    // 해당 기수의 세션 개수 업데이트
    await this.educationTermDomainService.decrementSessionsCount(
      educationTerm,
      qr,
    );

    // 완료된 세션일 경우
    if (targetSession.status === EducationSessionStatus.DONE) {
      await this.educationTermDomainService.decrementCompletedSessionsCount(
        educationTerm,
        qr,
      );
    }

    // Enrollment 의 출석 횟수 업데이트
    // 삭제할 세션에 출석한 교육 대상자 ID
    const presentedAttendances =
      await this.sessionAttendanceDomainService.findAttendedSessionAttendances(
        targetSession,
        qr,
      );

    const presentedEnrollmentIds = presentedAttendances.map(
      (p) => p.educationEnrollmentId,
    );

    await this.educationEnrollmentsDomainService.decrementAttendanceCountBySessionDeletion(
      presentedEnrollmentIds,
      qr,
    );

    // 해당 세션의 출석 정보 삭제
    await this.sessionAttendanceDomainService.deleteSessionAttendancesBySessionDeletion(
      targetSession.id,
      qr,
    );

    return new DeleteSessionResponseDto(
      new Date(),
      targetSession.id,
      educationTerm.educationName,
      educationTerm.term,
      targetSession.session,
      targetSession.title,
      true,
    );
  }

  async addReportReceivers(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    dto: AddEducationSessionReportDto,
    qr: QueryRunner,
  ) {
    const { church, education } = await this.getEducationInfo(
      churchId,
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
        educationSessionId,
        qr,
      );

    return this.handleAddEducationReport(
      church,
      education,
      educationTerm,
      educationSession,
      dto.receiverIds,
      qr,
    );
  }

  private async handleAddEducationReport(
    church: ChurchModel,
    education: EducationModel,
    educationTerm: EducationTermModel,
    educationSession: EducationSessionModel,
    newReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const newReceivers =
      await this.managerDomainService.findManagersByMemberIds(
        church,
        newReceiverIds,
        qr,
      );

    await this.educationSessionReportDomainService.createEducationSessionReports(
      education,
      educationTerm,
      educationSession,
      newReceivers,
      qr,
    );

    return {
      educationId: education.id,
      educationTermId: educationTerm.id,
      educationSessionId: educationSession.id,
      addReceivers: newReceivers.map((receiver) => ({
        id: receiver.memberId,
        name: receiver.member.name,
      })),
      addedCount: newReceivers.length,
    };
  }

  async deleteEducationSessionReportReceivers(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    dto: DeleteEducationSessionReportDto,
    qr: QueryRunner,
  ) {
    const educationTerm = await this.getEducationTerm(
      churchId,
      educationId,
      educationTermId,
      qr,
    );

    const educationSession =
      await this.educationSessionDomainService.findEducationSessionModelById(
        educationTerm,
        educationSessionId,
        qr,
      );

    const targetReports =
      await this.educationSessionReportDomainService.findEducationSessionReportModelsByReceiverIds(
        educationSession,
        dto.receiverIds,
        qr,
        { receiver: true },
      );

    const result =
      await this.educationSessionReportDomainService.deleteEducationSessionReports(
        targetReports,
        qr,
      );

    return {
      educationId: educationTerm.educationId,
      educationTermId: educationTerm.id,
      educationSessionId: educationSession.id,
      deletedReceivers: targetReports.map((report) => ({
        id: report.receiver.id,
        name: report.receiver.name,
      })),
      deletedCount: result.affected,
    };
  }
}
