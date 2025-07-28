import { Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import {
  IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-group-history-domain.service.interface';
import {
  IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupDetailHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-group-detail-history-domain.service.interface';

@Injectable()
export class MinistryGroupDetailHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupHistoryDomainService: IMinistryGroupHistoryDomainService,
    @Inject(IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupDetailHistoryDomainService: IMinistryGroupDetailHistoryDomainService,
  ) {}

  async getDetailHistories(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const groupHistory =
      await this.ministryGroupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
      );

    return this.ministryGroupDetailHistoryDomainService.paginateDetailHistories(
      groupHistory,
    );
  }
}
