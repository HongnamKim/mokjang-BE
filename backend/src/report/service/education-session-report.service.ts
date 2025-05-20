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

    return this.educationSessionReportDomainService.findEducationSessionReportById(
      receiver,
      reportId,
      true,
    );
  }
}
