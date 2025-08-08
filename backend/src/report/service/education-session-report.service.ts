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
import { UserModel } from '../../user/entity/user.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { ChurchUserGuard } from '../../church-user/guard/church-user.guard';

@Injectable()
export class EducationSessionReportService {
  constructor(
    @Inject(IEDUCATION_SESSION_REPORT_DOMAIN_SERVICE)
    private readonly educationSessionReportDomainService: IEducationSessionReportDomainService,
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
      deleteTarget.educationSessionId,
      deleteTarget.educationSession.title,
      true,
    );
  }
}
