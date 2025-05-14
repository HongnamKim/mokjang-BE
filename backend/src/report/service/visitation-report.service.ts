import { Inject, Injectable } from '@nestjs/common';
import {
  IVISITATION_REPORT_DOMAIN_SERVICE,
  IVisitationReportDomainService,
} from '../report-domain/interface/visitation-report-domain.service.interface';
import { GetVisitationReportDto } from '../dto/visitation-report/get-visitation-report.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { VisitationReportPaginationResultDto } from '../dto/visitation-report/visitation-report-pagination-result.dto';
import { QueryRunner } from 'typeorm';
import { UpdateVisitationReportDto } from '../dto/visitation-report/update-visitation-report.dto';

@Injectable()
export class VisitationReportService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IVISITATION_REPORT_DOMAIN_SERVICE)
    private readonly visitationReportDomainService: IVisitationReportDomainService,
  ) {}

  async getVisitationReport(
    churchId: number,
    memberId: number,
    dto: GetVisitationReportDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      undefined,
      { user: true },
    );

    const { data, totalCount } =
      await this.visitationReportDomainService.findVisitationReportsByReceiver(
        receiver,
        dto,
      );

    return new VisitationReportPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );

    /*const paginationResult: VisitationReportPaginationResultDto = {
      totalCount,
      data: data,
      count: dto.take,
      page: dto.page,
      totalPage: Math.ceil(totalCount / dto.take),
    };

    return paginationResult;*/
  }

  async getVisitationReportById(
    churchId: number,
    memberId: number,
    visitationReportId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
      { user: true },
    );

    return this.visitationReportDomainService.findVisitationReportById(
      receiver,
      visitationReportId,
      true,
      qr,
    );
  }

  async updateVisitationReport(
    churchId: number,
    memberId: number,
    visitationReportId: number,
    dto: UpdateVisitationReportDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

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
    churchId: number,
    memberId: number,
    visitationReportId: number,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const receiver = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

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
