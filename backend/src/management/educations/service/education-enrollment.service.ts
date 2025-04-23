import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationEnrollmentDto } from '../dto/enrollments/get-education-enrollment.dto';
import { CreateEducationEnrollmentDto } from '../dto/enrollments/create-education-enrollment.dto';
import { UpdateEducationEnrollmentDto } from '../dto/enrollments/update-education-enrollment.dto';
import {
  IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
  IEducationEnrollmentsDomainService,
} from './education-domain/interface/education-enrollment-domain.service.interface';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from './education-domain/interface/education-term-domain.service.interface';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from './education-domain/interface/education-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  ISESSION_ATTENDANCE_DOMAIN_SERVICE,
  ISessionAttendanceDomainService,
} from './education-domain/interface/session-attendance-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';

@Injectable()
export class EducationEnrollmentService {
  constructor(
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IEDUCATION_DOMAIN_SERVICE)
    private readonly educationDomainService: IEducationDomainService,
    @Inject(IEDUCATION_TERM_DOMAIN_SERVICE)
    private readonly educationTermDomainService: IEducationTermDomainService,
    @Inject(IEDUCATION_ENROLLMENT_DOMAIN_SERVICE)
    private readonly educationEnrollmentsDomainService: IEducationEnrollmentsDomainService,
    @Inject(ISESSION_ATTENDANCE_DOMAIN_SERVICE)
    private readonly sessionAttendanceDomainService: ISessionAttendanceDomainService,
  ) {}

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
        church,
        education,
        educationTermId,
        qr,
      );

    return this.educationEnrollmentsDomainService.findEducationEnrollments(
      educationTerm,
      dto,
      qr,
    );
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

    const member = await this.membersDomainService.findMemberModelById(
      church,
      dto.memberId,
      qr,
    );

    const educationTerm =
      await this.educationTermDomainService.findEducationTermModelById(
        church,
        education,
        educationTermId,
        qr,
        { educationSessions: true },
      );

    const enrollment =
      await this.educationEnrollmentsDomainService.createEducationEnrollment(
        educationTerm,
        member,
        dto,
        qr,
      );

    // 교육 등록 생성 후속 작업
    const educationSessionIds = educationTerm.educationSessions.map(
      (session) => session.id,
    );

    // 수강 대상 교인 수 증가 + 세션의 출석 정보 생성
    await Promise.all([
      // 교육 수강자 수 증가
      this.educationTermDomainService.incrementEnrollmentCount(
        educationTerm,
        qr,
      ),

      // 교육 수강자 상태 통계값 업데이트
      this.educationTermDomainService.incrementEducationStatusCount(
        educationTerm,
        dto.status,
        qr,
      ),

      // 수강자의 출석 정보 생성
      this.sessionAttendanceDomainService.createSessionAttendanceForNewEnrollment(
        enrollment,
        educationSessionIds,
        qr,
      ),
    ]);

    return this.educationEnrollmentsDomainService.findEducationEnrollmentById(
      educationTerm,
      enrollment.id,
      qr,
    );
  }

  async updateEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    dto: UpdateEducationEnrollmentDto,
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
        church,
        education,
        educationTermId,
        qr,
      );

    const targetEducationEnrollment =
      await this.educationEnrollmentsDomainService.findEducationEnrollmentModelById(
        educationEnrollmentId,
        qr,
      );

    // 교육 이수 상태 변경 시 해당 기수의 이수자 통계 업데이트
    // 교육 이수 상태를 변경 && 기존 이수 상태와 다를 경우
    if (dto.status && dto.status !== targetEducationEnrollment.status) {
      await Promise.all([
        // 기존 status 감소
        this.educationTermDomainService.decrementEducationStatusCount(
          educationTerm,
          targetEducationEnrollment.status,
          qr,
        ),

        // 새 status 증가
        this.educationTermDomainService.incrementEducationStatusCount(
          educationTerm,
          dto.status,
          qr,
        ),
      ]);
    }

    await this.educationEnrollmentsDomainService.updateEducationEnrollment(
      targetEducationEnrollment,
      dto,
      qr,
    );

    return this.educationEnrollmentsDomainService.findEducationEnrollmentById(
      educationTerm,
      educationEnrollmentId,
      qr,
    );
  }

  async deleteEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    qr: QueryRunner,
    memberDeleted: boolean = false,
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

    const targetEnrollment =
      await this.educationEnrollmentsDomainService.findEducationEnrollmentModelById(
        educationEnrollmentId,
        qr,
      );

    const member = memberDeleted
      ? await this.membersDomainService.findDeleteMemberModelById(
          church,
          targetEnrollment.memberId,
          { educations: true },
          qr,
        )
      : await this.membersDomainService.findMemberModelById(
          church,
          targetEnrollment.memberId,
          qr,
          { educations: true },
        );

    await Promise.all([
      // 교인 - 교육 관계 해제
      this.membersDomainService.endMemberEducation(
        member,
        educationEnrollmentId,
        qr,
      ),
      // 등록 인원 감소
      this.educationTermDomainService.decrementEnrollmentCount(
        educationTerm,
        qr,
      ),

      // 상태별 카운트 감소
      this.educationTermDomainService.decrementEducationStatusCount(
        educationTerm,
        targetEnrollment.status,
        qr,
      ),

      // 교육 등록 삭제
      this.educationEnrollmentsDomainService.deleteEducationEnrollment(
        targetEnrollment,
        qr,
      ),

      // 출석 정보 삭제
      this.sessionAttendanceDomainService.deleteSessionAttendanceByEnrollmentDeletion(
        targetEnrollment,
        qr,
      ),
    ]);

    return `educationEnrollment: ${educationEnrollmentId} deleted`;
  }
}
