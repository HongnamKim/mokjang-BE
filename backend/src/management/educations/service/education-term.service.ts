import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationTermDto } from '../dto/terms/request/get-education-term.dto';
import { CreateEducationTermDto } from '../dto/terms/request/create-education-term.dto';
import { UpdateEducationTermDto } from '../dto/terms/request/update-education-term.dto';
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
import { EducationTermPaginationResultDto } from '../dto/terms/response/education-term-pagination-result.dto';
import {
  IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
  IEducationEnrollmentsDomainService,
} from './education-domain/interface/education-enrollment-domain.service.interface';
import { DeleteEducationTermResponseDto } from '../dto/terms/response/delete-education-term-response.dto';
import { PatchEducationTermResponseDto } from '../dto/terms/response/patch-education-term-response.dto';
import { PostEducationTermResponseDto } from '../dto/terms/response/post-education-term-response.dto';
import { GetEducationTermResponseDto } from '../dto/terms/response/get-education-term-response.dto';
import { GetInProgressEducationTermDto } from '../dto/terms/request/get-in-progress-education-term.dto';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../../manager/manager-domain/service/interface/manager-domain.service.interface';

@Injectable()
export class EducationTermService {
  constructor(
    /*@Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,*/
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

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

    const { data, totalCount } =
      await this.educationTermDomainService.findEducationTerms(
        church,
        education,
        dto,
        qr,
      );

    return new EducationTermPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getInProgressEducationTerms(
    churchId: number,
    dto: GetInProgressEducationTermDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const { data, totalCount } =
      await this.educationTermDomainService.findInProgressEducationTerms(
        church,
        dto,
        qr,
      );

    return new EducationTermPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
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

    const educationTerm =
      await this.educationTermDomainService.findEducationTermById(
        church,
        education,
        educationTermId,
        qr,
      );

    return new GetEducationTermResponseDto(educationTerm);
  }

  async createEducationTerm(
    creatorUserId: number,
    churchId: number,
    educationId: number,
    dto: CreateEducationTermDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const creatorMember = (
      await this.managerDomainService.findManagerByUserId(
        church,
        creatorUserId,
        qr,
      )
    ).member;
    /*await this.membersDomainService.findMemberModelByUserId(
        church,
        creatorUserId,
        qr,
      );*/

    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    const inCharge = dto.inChargeId
      ? /*await this.membersDomainService.findMemberModelById(
          church,
          dto.inChargeId,
          qr,
          { user: true },
        )*/
        (
          await this.managerDomainService.findManagerById(
            church,
            dto.inChargeId,
            qr,
          )
        ).member
      : null;

    const educationTerm =
      await this.educationTermDomainService.createEducationTerm(
        //church,
        education,
        creatorMember,
        inCharge,
        dto,
        qr,
      );

    // 회차에 맞게 EducationSession 생성
    /*await this.educationSessionDomainService.createEducationSessions(
      educationTerm,
      educationTerm.numberOfSessions,
      qr,
    );*/

    //return educationTerm;
    const createdEducationTerm =
      await this.educationTermDomainService.findEducationTermById(
        church,
        education,
        educationTerm.id,
        qr,
      );

    return new PostEducationTermResponseDto(createdEducationTerm);
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
      );

    const newInCharge = dto.inChargeId
      ? /*await this.membersDomainService.findMemberModelById(
          church,
          dto.inChargeId,
          qr,
          { user: true },
        )*/
        (
          await this.managerDomainService.findManagerModelById(
            church,
            dto.inChargeId,
            qr,
          )
        ).member
      : null;

    await this.educationTermDomainService.updateEducationTerm(
      education,
      educationTerm,
      newInCharge,
      dto,
      qr,
    );

    const updatedEducationTerm =
      await this.educationTermDomainService.findEducationTermById(
        church,
        education,
        educationTermId,
        qr,
      );

    return new PatchEducationTermResponseDto(updatedEducationTerm);

    // 회차 수정 시
    // 회차 감소 --> 회차 삭제 X, 수동 삭제
    // 회차 증가 --> 회차 생성
    /*if (
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

      const enrollmentIds = (
        await this.educationEnrollmentDomainService.findEducationEnrollmentModels(
          educationTerm,
          qr,
        )
      ).map((enrollment) => enrollment.id);

      await this.sessionAttendanceDomainService.createAdditionalSessionAttendance(
        newSessionIds,
        enrollmentIds,
        qr,
      );
    }*/

    //return updatedEducationTerm;
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
    await this.educationSessionDomainService.deleteEducationSessionCascade(
      educationTerm,
      qr,
    );

    // 기수의 교육 등록 삭제
    await this.educationEnrollmentDomainService.deleteEducationEnrollmentsCascade(
      educationTerm,
      qr,
    );

    await this.educationTermDomainService.deleteEducationTerm(
      educationTerm,
      qr,
    );

    return new DeleteEducationTermResponseDto(
      new Date(),
      educationTerm.id,
      educationTerm.educationName,
      educationTerm.term,
      true,
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
