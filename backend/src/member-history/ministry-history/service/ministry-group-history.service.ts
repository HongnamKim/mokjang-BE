import { Inject, Injectable } from '@nestjs/common';
import {
  IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-group-history-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';

@Injectable()
export class MinistryGroupHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly ministryGroupHistoryDomainService: IMinistryGroupHistoryDomainService,
  ) {}

  async getMinistryGroupHistories(churchId: number, memberId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const histories =
      await this.ministryGroupHistoryDomainService.paginateMinistryGroupHistories(
        member,
      );

    return {
      data: histories,
      timestamp: new Date(),
    };
  }
}
