import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationEnrollmentDto } from '../dto/request/get-education-enrollment.dto';
import { CreateEducationEnrollmentDto } from '../dto/request/create-education-enrollment.dto';
import {
  IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
  IEducationEnrollmentsDomainService,
} from '../../education-domain/interface/education-enrollment-domain.service.interface';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from '../../education-domain/interface/education-term-domain.service.interface';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from '../../education-domain/interface/education-domain.service.interface';
import {
  ISESSION_ATTENDANCE_DOMAIN_SERVICE,
  ISessionAttendanceDomainService,
} from '../../education-domain/interface/session-attendance-domain.service.interface';
import { EducationEnrollmentPaginationResponseDto } from '../dto/response/education-enrollment-pagination-response.dto';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import { EducationEnrollmentStatus } from '../const/education-enrollment-status.enum';
import { PostEducationEnrollmentsResponseDto } from '../dto/response/post-education-enrollments-response.dto';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from '../../education-domain/interface/education-session-domain.service.interface';
import { EducationEnrollmentException } from '../exception/education-enrollment.exception';
import { PatchEducationEnrollmentResponseDto } from '../dto/response/patch-education-enrollment-response.dto';
import {
  IEDUCATION_MEMBERS_DOMAIN_SERVICE,
  IEducationMembersDomainService,
} from '../../../members/member-domain/interface/education-members-domain.service.interface';
import { GetNotEnrolledMembersDto } from '../dto/request/get-not-enrolled-members.dto';
import { NotEnrolledMembersPaginationResponseDto } from '../dto/response/not-enrolled-members-pagination-response.dto';

@Injectable()
export class EducationEnrollmentService {
  constructor(
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IEDUCATION_MEMBERS_DOMAIN_SERVICE)
    private readonly educationMembersDomainService: IEducationMembersDomainService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IEDUCATION_DOMAIN_SERVICE)
    private readonly educationDomainService: IEducationDomainService,
    @Inject(IEDUCATION_TERM_DOMAIN_SERVICE)
    private readonly educationTermDomainService: IEducationTermDomainService,
    @Inject(IEDUCATION_ENROLLMENT_DOMAIN_SERVICE)
    private readonly educationEnrollmentsDomainService: IEducationEnrollmentsDomainService,
    @Inject(IEDUCATION_SESSION_DOMAIN_SERVICE)
    private readonly educationSessionDomainService: IEducationSessionDomainService,
    @Inject(ISESSION_ATTENDANCE_DOMAIN_SERVICE)
    private readonly sessionAttendanceDomainService: ISessionAttendanceDomainService,
  ) {}

  async getNotEnrolledMembers(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: GetNotEnrolledMembersDto,
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

    const members =
      await this.educationMembersDomainService.findNotEnrolledMembers(
        church,
        educationTerm,
        dto,
        qr,
      );

    return new NotEnrolledMembersPaginationResponseDto(members);
  }

  async getEducationEnrollments(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: GetEducationEnrollmentDto,
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

    const data =
      await this.educationEnrollmentsDomainService.findEducationEnrollments(
        educationTerm,
        dto,
        qr,
      );

    return new EducationEnrollmentPaginationResponseDto(data);
  }

  async createEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: CreateEducationEnrollmentDto,
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
        { educationSessions: true },
      );

    const members = await this.membersDomainService.findMembersById(
      church,
      dto.memberIds,
      qr,
    );

    const enrollment =
      await this.educationEnrollmentsDomainService.createEducationEnrollment(
        educationTerm,
        members,
        qr,
      );

    // 교육 수강자 수 증가
    await this.educationTermDomainService.incrementEnrollmentCount(
      educationTerm,
      members.length,
      qr,
    );

    // 교육 수강자 상태 통계값 업데이트
    await this.educationTermDomainService.incrementEducationStatusCount(
      educationTerm,
      EducationEnrollmentStatus.INCOMPLETE,
      members.length,
      qr,
    );

    // 기수 하위에 세션이 존재할 경우 출석 정보 생성
    if (educationTerm.sessionsCount > 0) {
      const educationSessionIds = (
        await this.educationSessionDomainService.findEducationSessionIds(
          educationTerm,
          qr,
        )
      ).map((session) => session.id);

      if (educationSessionIds.length > 0) {
        await this.sessionAttendanceDomainService.createSessionAttendanceForNewEnrollment(
          enrollment,
          educationSessionIds,
          qr,
        );
      }
    }

    const newEnrollments =
      await this.educationEnrollmentsDomainService.findEducationEnrollmentsByIds(
        educationTerm,
        enrollment.map((e) => e.id),
        qr,
      );

    return new PostEducationEnrollmentsResponseDto(newEnrollments);
  }

  async updateEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    status: EducationEnrollmentStatus,
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

    const targetEducationEnrollment =
      await this.educationEnrollmentsDomainService.findEducationEnrollmentById(
        educationTerm,
        educationEnrollmentId,
        qr,
      );

    if (status === targetEducationEnrollment.status) {
      throw new BadRequestException(EducationEnrollmentException.SAME_STATUS);
    }

    // 기존 status 감소
    await this.educationTermDomainService.decrementEducationStatusCount(
      educationTerm,
      targetEducationEnrollment.status,
      1,
      qr,
    );

    // 새 status 증가
    await this.educationTermDomainService.incrementEducationStatusCount(
      educationTerm,
      status,
      1,
      qr,
    );

    // 총 이수자 수 증가
    if (status === EducationEnrollmentStatus.COMPLETED) {
      await this.educationDomainService.incrementCompletionMembersCount(
        education,
        qr,
      );
    }

    // 수료 --> 미수료 변경 시 총 이수자 감소
    if (status === EducationEnrollmentStatus.INCOMPLETE) {
      await this.educationDomainService.decrementCompletionMembersCount(
        education,
        qr,
      );
    }

    await this.educationEnrollmentsDomainService.updateEducationEnrollment(
      targetEducationEnrollment,
      status,
      qr,
    );

    // 변경값 적용
    targetEducationEnrollment.status = status;

    return new PatchEducationEnrollmentResponseDto(targetEducationEnrollment);
  }

  async deleteEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
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

    const targetEnrollment =
      await this.educationEnrollmentsDomainService.findEducationEnrollmentModelById(
        educationEnrollmentId,
        qr,
      );

    // 등록 인원 감소
    await this.educationTermDomainService.decrementEnrollmentCount(
      educationTerm,
      1,
      qr,
    );

    // 상태별 카운트 감소
    await this.educationTermDomainService.decrementEducationStatusCount(
      educationTerm,
      targetEnrollment.status,
      1,
      qr,
    );

    // 총 이수자 감소
    if ((targetEnrollment.status = EducationEnrollmentStatus.COMPLETED)) {
      await this.educationDomainService.decrementCompletionMembersCount(
        education,
        qr,
      );
    }

    // 교육 등록 삭제
    await this.educationEnrollmentsDomainService.deleteEducationEnrollment(
      targetEnrollment,
      qr,
    );

    // 출석 정보 삭제
    await this.sessionAttendanceDomainService.deleteSessionAttendanceCascade(
      targetEnrollment,
      qr,
    );

    return {
      timestamp: new Date(),
      id: targetEnrollment.id,
      success: true,
    };
  }
}
