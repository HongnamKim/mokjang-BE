import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IVISITATION_REPORT_DOMAIN_SERVICE,
  IVisitationReportDomainService,
} from '../report-domain/interface/visitation-report-domain.service.interface';
import { GetVisitationReportDto } from '../dto/visitation-report/get-visitation-report.dto';
import { VisitationReportPaginationResultDto } from '../dto/visitation-report/visitation-report-pagination-result.dto';
import { QueryRunner } from 'typeorm';
import { UpdateVisitationReportDto } from '../dto/visitation-report/update-visitation-report.dto';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@Injectable()
export class VisitationReportService {
  constructor(
    @Inject(IVISITATION_REPORT_DOMAIN_SERVICE)
    private readonly visitationReportDomainService: IVisitationReportDomainService,
  ) {}

  async getVisitationReport(
    churchUser: ChurchUserModel,
    dto: GetVisitationReportDto,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const data =
      await this.visitationReportDomainService.findVisitationReportsByReceiver(
        receiver,
        dto,
      );

    return new VisitationReportPaginationResultDto(data);
  }

  async getVisitationReportById(
    churchUser: ChurchUserModel,
    visitationReportId: number,
    qr: QueryRunner,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    return this.visitationReportDomainService.findVisitationReportById(
      receiver,
      visitationReportId,
      true,
      qr,
    );
  }

  async updateVisitationReport(
    churchUser: ChurchUserModel,
    visitationReportId: number,
    dto: UpdateVisitationReportDto,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const targetReport =
      await this.visitationReportDomainService.findVisitationReportModelById(
        receiver,
        visitationReportId,
      );

    await this.visitationReportDomainService.updateVisitationReport(
      targetReport,
      dto,
    );

    return this.visitationReportDomainService.findVisitationReportById(
      receiver,
      targetReport.id,
      false,
    );
  }

  async deleteVisitationReport(
    churchUser: ChurchUserModel,
    visitationReportId: number,
  ) {
    const receiver = churchUser.member;

    if (!receiver) {
      throw new ForbiddenException('교인 정보 없음');
    }

    const targetReport =
      await this.visitationReportDomainService.findVisitationReportModelById(
        receiver,
        visitationReportId,
      );

    await this.visitationReportDomainService.deleteVisitationReport(
      targetReport,
    );

    return `visitationReport id: ${targetReport.id} deleted`;
  }
}
