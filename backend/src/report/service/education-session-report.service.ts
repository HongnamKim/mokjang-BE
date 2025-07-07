import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
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
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import { MemberModel } from '../../members/entity/member.entity';

@Injectable()
export class EducationSessionReportService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,

    @Inject(IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE)
    private readonly educationSessionReportDomainService: IEducationSessionReportDomainService,
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

  async getEducationSessionReports(
    userId: number,
    dto: GetEducationSessionReportDto,
  ) {
    const currentMember = await this.getCurrentMember(userId);

    const { data, totalCount } =
      await this.educationSessionReportDomainService.findEducationSessionReports(
        currentMember,
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

  async getEducationSessionReportById(userId: number, reportId: number) {
    const receiver = await this.getCurrentMember(userId);

    const report =
      await this.educationSessionReportDomainService.findEducationSessionReportById(
        receiver,
        reportId,
        true,
      );

    return new GetEducationSessionReportResponseDto(report);
  }

  async patchEducationSessionReport(
    userId: number,
    reportId: number,
    dto: UpdateEducationSessionReportDto,
  ) {
    const receiver = await this.getCurrentMember(userId);

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
    userId: number,
    reportId: number,
    qr?: QueryRunner,
  ) {
    const receiver = await this.getCurrentMember(userId);

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
