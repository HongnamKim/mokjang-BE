import { Inject, Injectable } from '@nestjs/common';
import {
  IMINISTRY_GROUP_ROLE_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupRoleHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-group-role-history-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import { GetMinistryGroupRoleHistoriesDto } from '../dto/request/role/get-ministry-group-role-histories.dto';
import {
  IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE,
  IMinistryGroupHistoryDomainService,
} from '../ministry-history-domain/interface/ministry-group-history-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../../members/member-domain/interface/members-domain.service.interface';
import { DeleteMinistryGroupRoleHistoryResponseDto } from '../dto/response/role/delete-ministry-group-role-history-response.dto';
import { UpdateMinistryGroupRoleHistoryDto } from '../dto/request/role/update-ministry-group-role-history.dto';
import { convertHistoryDate } from '../../history-date.utils';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { PatchMinistryGroupRoleHistoryResponseDto } from '../dto/response/role/patch-ministry-group-role-history-response.dto';

@Injectable()
export class MinistryGroupRoleHistoryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE)
    private readonly groupHistoryDomainService: IMinistryGroupHistoryDomainService,
    @Inject(IMINISTRY_GROUP_ROLE_HISTORY_DOMAIN_SERVICE)
    private readonly roleHistoryDomainService: IMinistryGroupRoleHistoryDomainService,
  ) {}

  async getRoleHistories(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    dto: GetMinistryGroupRoleHistoriesDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );

    const groupHistory =
      await this.groupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
      );

    const histories =
      await this.roleHistoryDomainService.paginateMinistryGroupRoleHistory(
        groupHistory,
        dto,
      );

    return {
      data: histories,
      timestamp: new Date(),
    };
  }

  async deleteRoleHistory(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    roleHistoryId: number,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );
    const groupHistory =
      await this.groupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
      );

    const targetHistory =
      await this.roleHistoryDomainService.findMinistryGroupRoleHistoryModelById(
        groupHistory,
        roleHistoryId,
      );

    await this.roleHistoryDomainService.deleteMinistryGroupRoleHistory(
      targetHistory,
    );

    return new DeleteMinistryGroupRoleHistoryResponseDto(
      new Date(),
      targetHistory.id,
      true,
    );
  }

  async patchRoleHistory(
    churchId: number,
    memberId: number,
    ministryGroupHistoryId: number,
    roleHistoryId: number,
    dto: UpdateMinistryGroupRoleHistoryDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
    );
    const groupHistory =
      await this.groupHistoryDomainService.findMinistryGroupHistoryModelById(
        member,
        ministryGroupHistoryId,
      );

    const targetHistory =
      await this.roleHistoryDomainService.findMinistryGroupRoleHistoryModelById(
        groupHistory,
        roleHistoryId,
      );

    const historyDateUpdateValue = convertHistoryDate(
      dto.startDate,
      dto.endDate,
      TIME_ZONE.SEOUL,
    );

    await this.roleHistoryDomainService.updateMinistryGroupRoleHistory(
      targetHistory,
      historyDateUpdateValue,
    );

    if (historyDateUpdateValue.startDate)
      targetHistory.startDate = historyDateUpdateValue.startDate;
    if (historyDateUpdateValue.endDate)
      targetHistory.endDate = historyDateUpdateValue.endDate;

    return new PatchMinistryGroupRoleHistoryResponseDto(targetHistory);
  }
}
