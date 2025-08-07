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

@Injectable()
export class EducationTermReportService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,

    @Inject(IEDUCATION_TERM_REPORT_DOMAIN_SERVICE)
    private readonly educationTermReportDomainService: IEducationTermReportDomainService,
  ) {}

  private async getCurrentMember(userId: number): Promise<MemberModel> {
    const user = await this.userDomainService.findUserById(userId);

    const currentChurchUser = user.churchUser.find(
      (churchUser) => churchUser.leftAt === null,
    );

    if (!currentChurchUser) {
      throw new ForbiddenException('교회에 가입되지 않은 사용자');
    }

    if (!currentChurchUser.member) {
      throw new ForbiddenException('교인 정보 없음');
    }

    return currentChurchUser.member;
  }

  async getEducationTermReports(
    userId: number,
    dto: GetEducationTermReportsDto,
  ) {
    const currentMember = await this.getCurrentMember(userId);

    const data =
      await this.educationTermReportDomainService.findEducationTermReports(
        currentMember,
        dto,
      );

    return new EducationTermReportPaginationResponseDto(data);
  }

  async getEducationTermReportById(userId: number, reportId: number) {
    const currentMember = await this.getCurrentMember(userId);

    const report =
      await this.educationTermReportDomainService.findEducationTermReportById(
        currentMember,
        reportId,
        true,
      );

    return new GetEducationTermReportResponseDto(report);
  }

  async patchEducationTermReport(
    userId: number,
    reportId: number,
    dto: UpdateEducationTermReportDto,
  ) {
    const receiver = await this.getCurrentMember(userId);

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
    userId: number,
    reportId: number,
    qr?: QueryRunner,
  ) {
    const receiver = await this.getCurrentMember(userId);

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
