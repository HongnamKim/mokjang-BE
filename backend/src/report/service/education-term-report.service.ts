import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IEDUCATION_TERM_REPORT_DOMAIN_SERVICE,
  IEducationTermReportDomainService,
} from '../report-domain/interface/education-term-report-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import { MemberModel } from '../../members/entity/member.entity';
import { GetEducationTermReportsDto } from '../dto/education-report/term/request/get-education-term-reports.dto';
import { EducationTermReportPaginationResponseDto } from '../dto/education-report/term/response/education-term-report-pagination-response.dto';
import { GetEducationTermReportResponseDto } from '../dto/education-report/term/response/get-education-term-report-response.dto';
import { UpdateEducationTermReportDto } from '../dto/education-report/term/request/update-education-term-report.dto';
import { PatchEducationTermReportResponseDto } from '../dto/education-report/term/response/patch-education-term-report-response.dto';
import { QueryRunner } from 'typeorm';
import { DeleteEducationTermReportResponseDto } from '../dto/education-report/term/response/delete-education-term-report-response.dto';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@Injectable()
export class EducationTermReportService {
  constructor(
    @Inject(IEDUCATION_TERM_REPORT_DOMAIN_SERVICE)
    private readonly educationTermReportDomainService: IEducationTermReportDomainService,
  ) {}

  async getEducationTermReports(
    churchUser: ChurchUserModel,
    dto: GetEducationTermReportsDto,
  ) {
    const currentMember = churchUser.member;

    if (!currentMember) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const data =
      await this.educationTermReportDomainService.findEducationTermReports(
        currentMember,
        dto,
      );

    return new EducationTermReportPaginationResponseDto(data);
  }

  async getEducationTermReportById(
    churchUser: ChurchUserModel,
    reportId: number,
  ) {
    const currentMember = churchUser.member;

    if (!currentMember) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const report =
      await this.educationTermReportDomainService.findEducationTermReportById(
        currentMember,
        reportId,
        true,
      );

    return new GetEducationTermReportResponseDto(report);
  }

  async patchEducationTermReport(
    churchUser: ChurchUserModel,
    reportId: number,
    dto: UpdateEducationTermReportDto,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const targetReport =
      await this.educationTermReportDomainService.findEducationTermReportModelById(
        receiver,
        reportId,
      );

    await this.educationTermReportDomainService.updateEducationTermReport(
      targetReport,
      dto,
    );

    const updatedReport =
      await this.educationTermReportDomainService.findEducationTermReportById(
        receiver,
        reportId,
        false,
      );

    return new PatchEducationTermReportResponseDto(updatedReport);
  }

  async deleteEducationTermReport(
    churchUser: ChurchUserModel,
    reportId: number,
    qr?: QueryRunner,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const targetReport =
      await this.educationTermReportDomainService.findEducationTermReportModelById(
        receiver,
        reportId,
        qr,
        {
          educationTerm: true,
        },
      );

    await this.educationTermReportDomainService.deleteEducationTermReport(
      targetReport,
      qr,
    );

    return new DeleteEducationTermReportResponseDto(
      new Date(),
      targetReport.id,
      targetReport.educationId,
      targetReport.educationTermId,
      true,
    );
  }
}
