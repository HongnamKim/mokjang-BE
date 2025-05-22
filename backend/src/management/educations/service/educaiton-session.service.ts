import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { UpdateEducationSessionDto } from '../dto/sessions/request/update-education-session.dto';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from './education-domain/interface/education-session-domain.service.interface';
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
  ISESSION_ATTENDANCE_DOMAIN_SERVICE,
  ISessionAttendanceDomainService,
} from './education-domain/interface/session-attendance-domain.service.interface';
import { CreateEducationSessionDto } from '../dto/sessions/request/create-education-session.dto';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import { PostEducationSessionResponseDto } from '../dto/sessions/response/post-education-session-response.dto';
import { GetEducationSessionDto } from '../dto/sessions/request/get-education-session.dto';
import { EducationSessionPaginationResponseDto } from '../dto/sessions/response/education-session-pagination-response.dto';
import { GetEducationSessionResponseDto } from '../dto/sessions/response/get-education-session-response.dto';
import { EducationSessionStatus } from '../const/education-status.enum';
import { PatchEducationSessionResponseDto } from '../dto/sessions/response/patch-education-session-response.dto';
import { DeleteSessionResponseDto } from '../dto/sessions/response/delete-education-session-response.dto';
import {
  IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE,
  IEducationSessionReportDomainService,
} from '../../../report/report-domain/interface/education-session-report-domain.service.interface';
import { AddEducationSessionReportDto } from '../../../report/dto/education-report/session/request/add-education-session-report.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { EducationTermModel } from '../entity/education-term.entity';
import { EducationModel } from '../entity/education.entity';
import { DeleteEducationSessionReportDto } from '../../../report/dto/education-report/session/request/delete-education-session-report.dto';

@Injectable()
export class EducationSessionService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

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
    const { church, education } = await this.getEducationInfo(
      churchId,
      educationId,
      qr,
    );

    return this.educationTermDomainService.findEducationTermModelById(
      church,
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

    const { data, totalCount } =
      await this.educationSessionDomainService.findEducationSessions(
        educationTerm,
        dto,
      );

    return new EducationSessionPaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
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

  async createSingleEducationSession(
    creatorMemberId: number,
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
        church,
        education,
        educationTermId,
        qr,
        { educationEnrollments: true },
      );

    const creatorMember =
      await this.membersDomainService.findMemberModelByUserId(
        church,
        creatorMemberId,
        qr,
      );

    const inCharge = dto.inChargeId
      ? await this.membersDomainService.findMemberModelById(
          church,
          dto.inChargeId,
          qr,
          { user: true },
        )
      : null;

    const newSession =
      await this.educationSessionDomainService.createSingleEducationSession(
        educationTerm,
        creatorMember,
        dto,
        inCharge,
        qr,
      );

    await Promise.all([
      // 교육 세션 개수 업데이트
      this.educationTermDomainService.incrementNumberOfSessions(
        educationTerm,
        qr,
      ),
      // 세션 출석 정보 생성
      this.sessionAttendanceDomainService.createSessionAttendance(
        newSession,
        educationTerm.educationEnrollments,
        qr,
      ),
      // 완료 상태 회차를 만들 경우 isDoneCount 증가
      dto.status === EducationSessionStatus.DONE &&
        this.educationTermDomainService.incrementDoneCount(educationTerm, qr),
    ]);

    if (dto.receiverIds && dto.receiverIds.length > 0) {
      await this.handleAddTaskReport(
        church,
        education,
        educationTerm,
        newSession.id,
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
        church,
        education,
        educationTermId,
        qr,
      );

    const inCharge = dto.inChargeId
      ? await this.membersDomainService.findMemberModelById(
          church,
          dto.inChargeId,
          qr,
          { user: true },
        )
      : null;

    const targetSession =
      await this.educationSessionDomainService.findEducationSessionModelById(
        educationTerm,
        educationSessionId,
        qr,
      );

    /*
    기존 session 의 isDone 이 true
    --> dto.isDone = true -> isDoneCount 변화 X
    --> dto.isDone = false -> isDoneCount 감소
    */
    if (dto.status) {
      if (
        targetSession.status === EducationSessionStatus.DONE &&
        dto.status !== EducationSessionStatus.DONE
      ) {
        await this.educationTermDomainService.decrementDoneCount(
          educationTerm,
          qr,
        );
      } else if (
        targetSession.status !== EducationSessionStatus.DONE &&
        dto.status === EducationSessionStatus.DONE
      ) {
        await this.educationTermDomainService.incrementDoneCount(
          educationTerm,
          qr,
        );
      }
    }

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
        { sessionAttendances: true, reports: true },
      );

    await Promise.all([
      // 세션 삭제
      this.educationSessionDomainService.deleteEducationSession(
        targetSession,
        qr,
      ),

      // 세션의 보고 삭제
      this.educationSessionReportDomainService.deleteEducationSessionReports(
        targetSession.reports,
        qr,
      ),

      // 다른 회차들 session 번호 수정
      this.educationSessionDomainService.reorderSessionsAfterDeletion(
        educationTerm,
        targetSession,
        qr,
      ),

      // 해당 기수의 세션 개수 업데이트
      this.educationTermDomainService.decrementNumberOfSessions(
        educationTerm,
        qr,
      ),
    ]);

    if (targetSession.status === EducationSessionStatus.DONE) {
      await this.educationTermDomainService.decrementDoneCount(
        educationTerm,
        qr,
      );
    }

    // 해당 세션 하위의 출석 정보 삭제
    // 삭제할 세션에 출석한 교육 대상자 ID
    const attended = targetSession.sessionAttendances.filter(
      (attendance) => attendance.isPresent,
    );

    const attendedEnrollmentIds = attended.map(
      (attendance) => attendance.educationEnrollmentId,
    );

    // 해당 세션의 출석 정보 삭제
    await this.sessionAttendanceDomainService.deleteSessionAttendancesBySessionDeletion(
      targetSession.id,
      qr,
    );

    await this.educationEnrollmentsDomainService.decrementAttendanceCountBySessionDeletion(
      attendedEnrollmentIds,
      qr,
    );

    return new DeleteSessionResponseDto(
      new Date(),
      targetSession.id,
      educationTerm.educationName,
      educationTerm.term,
      targetSession.session,
      targetSession.name,
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
        church,
        education,
        educationTermId,
        qr,
      );

    return this.handleAddTaskReport(
      church,
      education,
      educationTerm,
      educationSessionId,
      dto.receiverIds,
      qr,
    );
  }

  private async handleAddTaskReport(
    church: ChurchModel,
    education: EducationModel,
    educationTerm: EducationTermModel,
    educationSessionId: number,
    newReceiverIds: number[],
    qr: QueryRunner,
  ) {
    const newReceivers = await this.membersDomainService.findMembersById(
      church,
      newReceiverIds,
      qr,
      { user: true },
    );

    const educationSession =
      await this.educationSessionDomainService.findEducationSessionModelById(
        educationTerm,
        educationSessionId,
        qr,
        { reports: true },
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
        id: receiver.id,
        name: receiver.name,
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
    const { church, education } = await this.getEducationInfo(
      churchId,
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
      await this.educationSessionDomainService.findEducationSessionModelById(
        educationTerm,
        educationSessionId,
        qr,
        { reports: { receiver: true } },
      );

    const result = await this.educationSessionReportDomainService.delete(
      educationSession.id,
      dto.receiverIds,
      qr,
    );

    /*const reports = educationSession.reports;
    const oldReceiverIds = new Set(reports.map((report) => report.receiverId));

    const notExistReceiverIds = dto.receiverIds.filter(
      (newReceiverId) => !oldReceiverIds.has(newReceiverId),
    );

    if (notExistReceiverIds.length > 0) {
      throw new RemoveConflictException(
        EducationSessionReportException.NOT_EXIST_REPORTED_MEMBER,
        notExistReceiverIds,
      );
    }

    const deleteReports = reports.filter((report) =>
      dto.receiverIds.includes(report.receiverId),
    );

    const result =
      await this.educationSessionReportDomainService.deleteEducationSessionReports(
        deleteReports,
        qr,
      );*/

    return {
      educationId: education.id,
      educationTermId: educationTerm.id,
      educationSessionId: educationSession.id,
      addReceivers: educationSession.reports
        .filter((report) => dto.receiverIds.includes(report.receiverId))
        .map((report) => ({
          id: report.receiver.id,
          name: report.receiver.name,
        })),
      addedCount: result.affected,
    };
  }
}
