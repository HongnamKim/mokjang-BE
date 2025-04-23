import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationTermDto } from '../dto/terms/get-education-term.dto';
import { CreateEducationTermDto } from '../dto/terms/create-education-term.dto';
import { UpdateEducationTermDto } from '../dto/terms/update-education-term.dto';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from './education-domain/interface/education-term-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from './education-domain/interface/education-domain.service.interface';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from './education-domain/interface/education-session-domain.service.interface';
import {
  ISESSION_ATTENDANCE_DOMAIN_SERVICE,
  ISessionAttendanceDomainService,
} from './education-domain/interface/session-attendance-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';

@Injectable()
export class EducationTermService {
  constructor(
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IEDUCATION_DOMAIN_SERVICE)
    private readonly educationDomainService: IEducationDomainService,
    @Inject(IEDUCATION_TERM_DOMAIN_SERVICE)
    private readonly educationTermDomainService: IEducationTermDomainService,
    @Inject(IEDUCATION_SESSION_DOMAIN_SERVICE)
    private readonly educationSessionDomainService: IEducationSessionDomainService,
    @Inject(ISESSION_ATTENDANCE_DOMAIN_SERVICE)
    private readonly sessionAttendanceDomainService: ISessionAttendanceDomainService,
  ) {}

  async getEducationTerms(
    churchId: number,
    educationId: number,
    dto: GetEducationTermDto,
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

    return this.educationTermDomainService.findEducationTerms(
      church,
      education,
      dto,
      qr,
    );
  }

  async getEducationTermById(
    churchId: number,
    educationId: number,
    educationTermId: number,
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

    return this.educationTermDomainService.findEducationTermById(
      church,
      education,
      educationTermId,
      qr,
    );
  }

  async createEducationTerm(
    churchId: number,
    educationId: number,
    dto: CreateEducationTermDto,
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

    const instructor = dto.instructorId
      ? await this.membersDomainService.findMemberModelById(
          church,
          dto.instructorId,
          qr,
        )
      : null;

    const educationTerm =
      await this.educationTermDomainService.createEducationTerm(
        church,
        education,
        instructor,
        dto,
        qr,
      );

    // 회차에 맞게 EducationSession 생성
    await this.educationSessionDomainService.createEducationSessions(
      educationTerm,
      educationTerm.numberOfSessions,
      qr,
    );

    return educationTerm;
  }

  async updateEducationTerm(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: UpdateEducationTermDto,
    qr: QueryRunner,
  ) {
    /*
    1. 교육회차만 업데이트
      1-1. 기존 이수조건보다 큰 경우 --> 정상 업데이트
      1-2. 기존 이수조건보다 작은 경우 --> 교육회차는 이수조건보다 크거나 같아야함. BadRequestException

    2. 교육회차 + 이수조건 업데이트
      2-1. DTO 에서 교육회차가 이수조건 이상으로 검증 --> 정상 업데이트

    3. 이수조건 업데이트
      3-1. 교육회차보다 이하인 경우 --> 정상 업데이트
      3-2. 교육회차보다 큰 경우 --> 이수조건은 교육회차보다 작거나 같아야함. BadRequestException

    4. 시작일 업데이트
      4-1. 기존 종료일보다 앞선 경우 --> 정상 업데이트
      4-2. 기존 종요일보다 뒤인 경우 --> 시작일은 종료일 뒤의 날짜일 수 없음. BadRequestException

    5. 시작일 + 종료일 업데이트
      5-1. DTO 에서 검증 완료 --> 정상 업데이트

    6. 종료일 업데이트
      6-1. 기존 시작일보다 뒤인 경우 --> 정상 업데이트
      6-2. 기존 시작일보다 앞일 경우 --> 종료일은 시작일을 앞설 수 없음. BadRequestException

    7. 진행자 업데이트
      7-1. 진행자가 해당 교회에 소속 --> 정상 업데이트
      7-2. 진행자가 해당 교회에 소속X --> 해당 교인을 찾을 수 없음. NotFoundException
     */

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
        { educationEnrollments: true, educationSessions: true },
      );
    const newInstructor = dto.instructorId
      ? await this.membersDomainService.findMemberModelById(
          church,
          dto.instructorId,
          qr,
        )
      : null;

    const updatedEducationTerm =
      await this.educationTermDomainService.updateEducationTerm(
        education,
        educationTerm,
        newInstructor,
        dto,
        qr,
      );

    // 회차 수정 시
    // 회차 감소 --> 회차 삭제 X, 수동 삭제
    // 회차 증가 --> 회차 생성
    if (
      dto.numberOfSessions &&
      dto.numberOfSessions > educationTerm.educationSessions.length
    ) {
      // dto: 8, term: 5 --> session 6, 7, 8 생성
      const newSessions =
        await this.educationSessionDomainService.createAdditionalSessions(
          educationTerm,
          dto.numberOfSessions,
          qr,
        );

      // 증가된 세션에 대한 출석 정보 생성
      const newSessionIds = newSessions.map((newSession) => newSession.id);
      const enrollmentIds = educationTerm.educationEnrollments.map(
        (enrollment) => enrollment.id,
      );

      await this.sessionAttendanceDomainService.createAdditionalSessionAttendance(
        newSessionIds,
        enrollmentIds,
        qr,
      );
    }

    return updatedEducationTerm;
  }

  async deleteEducationTerm(
    churchId: number,
    educationId: number,
    educationTermId: number,
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
        {},
      );

    // 기수의 세션들 삭제
    await this.educationSessionDomainService.deleteEducationSessionCasCade(
      educationTerm,
      qr,
    );

    return await this.educationTermDomainService.deleteEducationTerm(
      educationTerm,
      qr,
    );
  }

  async syncSessionAttendances(
    churchId: number,
    educationId: number,
    educationTermId: number,
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
        {
          educationSessions: true,
          educationEnrollments: true,
        },
        {
          educationSessions: {
            id: true,
          },
          educationEnrollments: {
            id: true,
          },
        },
      );

    return this.sessionAttendanceDomainService.syncSessionAttendances(
      educationTerm,
      qr,
    );
  }
}
