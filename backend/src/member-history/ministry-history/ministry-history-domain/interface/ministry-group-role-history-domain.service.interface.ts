import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MinistryGroupRoleHistoryModel } from '../../entity/ministry-group-role-history.entity';
import { GetMinistryGroupRoleHistoriesDto } from '../../dto/request/role/get-ministry-group-role-histories.dto';
import { HistoryUpdateDate } from '../../../history-date.utils';

export const IMINISTRY_GROUP_ROLE_HISTORY_DOMAIN_SERVICE = Symbol(
  'IMINISTRY_GROUP_ROLE_HISTORY_DOMAIN_SERVICE',
);

export interface IMinistryGroupRoleHistoryDomainService {
  paginateMinistryGroupRoleHistory(
    ministryGroupRoleHistory: MinistryGroupHistoryModel,
    dto: GetMinistryGroupRoleHistoriesDto,
    qr?: QueryRunner,
  ): Promise<MinistryGroupRoleHistoryModel[]>;

  findMinistryGroupRoleHistoryModelById(
    ministryGroupHistory: MinistryGroupHistoryModel,
    ministryGroupRoleHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupRoleHistoryModel>,
  ): Promise<MinistryGroupRoleHistoryModel>;

  startMinistryGroupRoleHistory(
    ministryGroupHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<MinistryGroupRoleHistoryModel>;

  endMinistryGroupRoleHistory(
    ministryGroupHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<MinistryGroupRoleHistoryModel>;

  updateMinistryGroupRoleHistory(
    targetHistory: MinistryGroupRoleHistoryModel,
    historyDateUpdateValue: HistoryUpdateDate,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteMinistryGroupRoleHistory(
    targetHistory: MinistryGroupRoleHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
