import { Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import {
  IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE,
  IEducationSessionReportDomainService,
} from '../report-domain/interface/education-session-report-domain.service.interface';
import { GetEducationSessionReportDto } from '../dto/education-report/session/request/get-education-session-report.dto';
import { EducationSessionReportPaginationResultDto } from '../dto/education-report/session/response/education-session-report-pagination-result.dto';
import { UpdateEducationSessionReportDto } from '../dto/education-report/session/request/update-education-session-report.dto';
import { PatchEducationSessionReportResponseDto } from '../dto/education-report/session/response/patch-education-session-report-response.dto';
import { GetEducationSessionReportResponseDto } from '../dto/education-report/session/response/get-education-session-report-response.dto';
import { QueryRunner } from 'typeorm';
import { DeleteEducationSessionReportResponseDto } from '../dto/education-report/session/response/delete-education-session-report-response.dto';

@Injectable()
export class EducationSessionReportService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE)
    private readonly educationSessionReportDomainService: IEducationSessionReportDomainService,
  ) {}

  async getEducationSessionReports(
    churchId: number,
    memberId: number,
    dto: GetEducationSessionReportDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const { data, totalCount } =
      await this.educationSessionReportDomainService.findEducationSessionReports(
        receiver,
        dto,
      );

    return new EducationSessionReportPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getEducationSessionReportById(
    churchId: number,
    receiverId: number,
    reportId: number,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      receiverId,
    );

    const report =
      await this.educationSessionReportDomainService.findEducationSessionReportById(
        receiver,
        reportId,
        true,
      );

    return new GetEducationSessionReportResponseDto(report);
  }

  async patchEducationSessionReport(
    churchId: number,
    memberId: number,
    reportId: number,
    dto: UpdateEducationSessionReportDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const targetReport =
      await this.educationSessionReportDomainService.findEducationSessionReportModelById(
        receiver,
        reportId,
      );

    await this.educationSessionReportDomainService.updateEducationSessionReport(
      targetReport,
      dto,
    );

    const updatedReport =
      await this.educationSessionReportDomainService.findEducationSessionReportById(
        receiver,
        reportId,
        false,
      );

    return new PatchEducationSessionReportResponseDto(updatedReport);
  }

  async deleteEducationSessionReport(
    churchId: number,
    receiverId: number,
    reportId: number,
    qr?: QueryRunner,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      receiverId,
    );

    const deleteTarget =
      await this.educationSessionReportDomainService.findEducationSessionReportModelById(
        receiver,
        reportId,
        qr,
        { educationSession: true },
      );

    await this.educationSessionReportDomainService.deleteEducationSessionReport(
      deleteTarget,
      qr,
    );

    return new DeleteEducationSessionReportResponseDto(
      new Date(),
      reportId,
      deleteTarget.educationId,
      deleteTarget.educationTermId,
      deleteTarget.educationSessionId,
      deleteTarget.educationSession.title,
      true,
    );
  }
}
