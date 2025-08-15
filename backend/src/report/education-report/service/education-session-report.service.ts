import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IEDUCATION_REPORT_DOMAIN_SERVICE,
  IEducationReportDomainService,
} from '../education-report-domain/interface/education-report-domain.service.interface';
import { QueryRunner } from 'typeorm';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { GetEducationSessionReportDto } from '../dto/session/request/get-education-session-report.dto';
import { EducationSessionReportPaginationResultDto } from '../dto/session/response/education-session-report-pagination-result.dto';
import { GetEducationSessionReportResponseDto } from '../dto/session/response/get-education-session-report-response.dto';
import { UpdateEducationSessionReportDto } from '../dto/session/request/update-education-session-report.dto';
import { PatchEducationSessionReportResponseDto } from '../dto/session/response/patch-education-session-report-response.dto';
import { DeleteEducationSessionReportResponseDto } from '../dto/session/response/delete-education-session-report-response.dto';

@Injectable()
export class EducationSessionReportService {
  constructor(
    @Inject(IEDUCATION_REPORT_DOMAIN_SERVICE)
    private readonly educationSessionReportDomainService: IEducationReportDomainService,
  ) {}

  async getEducationSessionReports(
    churchUser: ChurchUserModel,
    dto: GetEducationSessionReportDto,
  ) {
    const currentMember = churchUser.member;

    if (!currentMember) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const data =
      await this.educationSessionReportDomainService.findEducationSessionReports(
        currentMember,
        dto,
      );

    return new EducationSessionReportPaginationResultDto(data);
  }

  async getEducationSessionReportById(
    churchUser: ChurchUserModel,
    reportId: number,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const report =
      await this.educationSessionReportDomainService.findEducationSessionReportById(
        receiver,
        reportId,
        true,
      );

    return new GetEducationSessionReportResponseDto(report);
  }

  async patchEducationSessionReport(
    churchUser: ChurchUserModel,
    reportId: number,
    dto: UpdateEducationSessionReportDto,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

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
    churchUser: ChurchUserModel,
    reportId: number,
    qr?: QueryRunner,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

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
      deleteTarget.educationSessionId ? deleteTarget.educationSessionId : 0,
      deleteTarget.educationSession ? deleteTarget.educationSession.title : '',
      true,
    );
  }
}
