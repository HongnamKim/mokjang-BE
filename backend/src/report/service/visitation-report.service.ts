import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class VisitationReportService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,

    @Inject(IVISITATION_REPORT_DOMAIN_SERVICE)
    private readonly visitationReportDomainService: IVisitationReportDomainService,
  ) {}

  private async getCurrentMember(userId: number) {
    const user = await this.userDomainService.findUserById(userId);

    const currentChurchUser = user.churchUser.find(
      (churchUser) => churchUser.leftAt === null,
    );

    if (!currentChurchUser) {
      throw new BadRequestException('교회에 가입되지 않은 사용자');
    }

    return currentChurchUser.member;
  }

  async getVisitationReport(userId: number, dto: GetVisitationReportDto) {
    const receiver = await this.getCurrentMember(userId);

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
  }

  async getVisitationReportById(
    userId: number,
    visitationReportId: number,
    qr: QueryRunner,
  ) {
    const receiver = await this.getCurrentMember(userId);

    return this.visitationReportDomainService.findVisitationReportById(
      receiver,
      visitationReportId,
      true,
      qr,
    );
  }

  async updateVisitationReport(
    userId: number,
    visitationReportId: number,
    dto: UpdateVisitationReportDto,
  ) {
    const receiver = await this.getCurrentMember(userId);

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

  async deleteVisitationReport(userId: number, visitationReportId: number) {
    const receiver = await this.getCurrentMember(userId);

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
