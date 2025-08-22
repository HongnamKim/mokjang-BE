import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { GetEducationTermDto } from '../dto/request/get-education-term.dto';
import { CreateEducationTermDto } from '../dto/request/create-education-term.dto';
import { UpdateEducationTermDto } from '../dto/request/update-education-term.dto';
import {
  IEDUCATION_TERM_DOMAIN_SERVICE,
  IEducationTermDomainService,
} from '../../education-domain/interface/education-term-domain.service.interface';
import {
  IEDUCATION_DOMAIN_SERVICE,
  IEducationDomainService,
} from '../../education-domain/interface/education-domain.service.interface';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from '../../education-domain/interface/education-session-domain.service.interface';
import {
  ISESSION_ATTENDANCE_DOMAIN_SERVICE,
  ISessionAttendanceDomainService,
} from '../../education-domain/interface/session-attendance-domain.service.interface';
import { EducationTermPaginationResponseDto } from '../dto/response/education-term-pagination-response.dto';
import {
  IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
  IEducationEnrollmentsDomainService,
} from '../../education-domain/interface/education-enrollment-domain.service.interface';
import { DeleteEducationTermResponseDto } from '../dto/response/delete-education-term-response.dto';
import { PatchEducationTermResponseDto } from '../dto/response/patch-education-term-response.dto';
import { PostEducationTermResponseDto } from '../dto/response/post-education-term-response.dto';
import { GetEducationTermResponseDto } from '../dto/response/get-education-term-response.dto';
import { GetInProgressEducationTermDto } from '../dto/request/get-in-progress-education-term.dto';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../../manager/manager-domain/service/interface/manager-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { EducationTermConstraints } from '../const/education-term.constraints';
import { EducationTermException } from '../exception/education-term.exception';
import { EducationModel } from '../../education/entity/education.entity';
import { EducationTermModel } from '../entity/education-term.entity';
import {
  IEDUCATION_REPORT_DOMAIN_SERVICE,
  IEducationReportDomainService,
} from '../../../report/education-report/education-report-domain/interface/education-report-domain.service.interface';
import { AddEducationTermReportDto } from '../dto/request/report/add-education-term-report.dto';
import { DeleteEducationTermReportDto } from '../dto/request/report/delete-education-term-report.dto';

@Injectable()
export class EducationTermService {
  constructor(
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

    @Inject(IEDUCATION_REPORT_DOMAIN_SERVICE)
    private readonly educationReportDomainService: IEducationReportDomainService,
  ) {}

  async getEducationTerms(
    church: ChurchModel,
    educationId: number,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ) {
    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    const data = await this.educationTermDomainService.findEducationTerms(
      education,
      dto,
      qr,
    );

    return new EducationTermPaginationResponseDto(data);
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

    const data =
      await this.educationTermDomainService.findInProgressEducationTerms(
        church,
        dto,
        qr,
      );

    return new EducationTermPaginationResponseDto(data);
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
        education,
        educationTermId,
        qr,
      );

    return new GetEducationTermResponseDto(educationTerm);
  }

  async createEducationTerm(
    creatorManager: ChurchUserModel,
    church: ChurchModel,
    educationId: number,
    dto: CreateEducationTermDto,
    qr: QueryRunner,
  ) {
    const education = await this.educationDomainService.findEducationModelById(
      church,
      educationId,
      qr,
    );

    if (education.termsCount > EducationTermConstraints.MAX_COUNT) {
      throw new ConflictException(
        EducationTermException.MAX_TERMS_COUNT_REACHED,
      );
    }

    const inCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerByMemberId(
          church,
          dto.inChargeId,
          qr,
        )
      : null;

    dto.utcStartDate = fromZonedTime(dto.startDate, TIME_ZONE.SEOUL);
    dto.utcEndDate = fromZonedTime(dto.endDate, TIME_ZONE.SEOUL);

    const educationTerm =
      await this.educationTermDomainService.createEducationTerm(
        education,
        creatorManager,
        inCharge,
        dto,
        qr,
      );

    await this.educationDomainService.incrementTermsCount(education, qr);

    if (dto.receiverIds && dto.receiverIds.length > 0) {
      await this.handleAddEducationTermReport(
        church,
        education,
        educationTerm,
        dto.receiverIds,
        qr,
      );
    }

    return new PostEducationTermResponseDto(educationTerm);
  }

  async updateEducationTerm(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: UpdateEducationTermDto,
    qr: QueryRunner,
  ) {
    /*
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
        education,
        educationTermId,
        qr,
      );

    const newInCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerByMemberId(
          church,
          dto.inChargeId,
          qr,
        )
      : null;

    dto.utcStartDate = dto.startDate
      ? fromZonedTime(dto.startDate, TIME_ZONE.SEOUL)
      : undefined;
    dto.utcEndDate = dto.endDate
      ? fromZonedTime(dto.endDate, TIME_ZONE.SEOUL)
      : undefined;

    await this.educationTermDomainService.updateEducationTerm(
      education,
      educationTerm,
      newInCharge,
      dto,
      qr,
    );

    const updatedEducationTerm =
      await this.educationTermDomainService.findEducationTermById(
        education,
        educationTermId,
        qr,
      );

    return new PatchEducationTermResponseDto(updatedEducationTerm);
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
        education,
        educationTermId,
        qr,
        {},
      );

    if (educationTerm.sessionsCount > 0) {
      // 기수의 세션들 삭제
      await this.educationSessionDomainService.deleteEducationSessionCascade(
        educationTerm,
        qr,
      );
    }

    if (educationTerm.enrollmentsCount > 0) {
      // 기수의 교육 등록 삭제
      await this.educationEnrollmentDomainService.deleteEducationEnrollmentsCascade(
        educationTerm,
        qr,
      );
    }

    // 기수 보고 삭제
    await this.educationReportDomainService.deleteEducationTermReportsCascade(
      educationTerm,
      qr,
    );

    await this.educationTermDomainService.deleteEducationTerm(
      educationTerm,
      qr,
    );

    await this.educationDomainService.decrementTermsCount(education, qr);

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

  private async handleAddEducationTermReport(
    church: ChurchModel,
    education: EducationModel,
    educationTerm: EducationTermModel,
    receiverIds: number[],
    qr: QueryRunner,
  ) {
    const newReceivers =
      await this.managerDomainService.findManagersByMemberIds(
        church,
        receiverIds,
        qr,
      );

    await this.educationReportDomainService.createEducationTermReports(
      education,
      educationTerm,
      newReceivers,
      qr,
    );

    return {
      educationId: education.id,
      educationTerm: educationTerm.id,
      addReceivers: newReceivers.map((receiver) => ({
        id: receiver.memberId,
        name: receiver.member.name,
      })),
      addedCount: newReceivers.length,
    };
  }

  async addReportReceivers(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: AddEducationTermReportDto,
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

    return this.handleAddEducationTermReport(
      church,
      education,
      educationTerm,
      dto.receiverIds,
      qr,
    );
  }

  async deleteEducationTermReportReceivers(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: DeleteEducationTermReportDto,
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

    const targetReports =
      await this.educationReportDomainService.findEducationTermReportModelsByReceiverIds(
        educationTerm,
        dto.receiverIds,
        qr,
        { receiver: true },
      );

    const result =
      await this.educationReportDomainService.deleteEducationTermReports(
        targetReports,
        qr,
      );

    return {
      educationId: educationTerm.educationId,
      educationTermId: educationTerm.id,
      deletedReceivers: targetReports.map((report) => ({
        id: report.receiver.id,
        name: report.receiver.name,
      })),
      deletedCount: result.affected,
    };
  }
}
