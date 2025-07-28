import { MemberModel } from '../../../../members/entity/member.entity';
import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MinistryGroupDetailHistoryModel } from '../../entity/ministry-group-detail-history.entity';
import { MinistryGroupRoleHistoryModel } from '../../entity/child/ministry-group-role-history.entity';
import { StartMinistryHistoryVo } from '../../dto/start-ministry-history.vo';
import { MinistryHistoryModel } from '../../entity/child/ministry-history.entity';
import { EndMinistryHistoryVo } from '../../dto/end-ministry-history.vo';

export const IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE = Symbol(
  'IMINISTRY_GROUP_DETAIL_HISTORY_DOMAIN_SERVICE',
);

export interface IMinistryGroupDetailHistoryDomainService {
  paginateDetailHistories(
    ministryGroupHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<MinistryGroupDetailHistoryModel[]>;

  findMinistryDetailHistoryModelById(
    member: MemberModel,
    ministryGroupHistory: MinistryGroupHistoryModel,
    detailId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupDetailHistoryModel>,
  ): Promise<MinistryGroupDetailHistoryModel>;

  startMinistryHistories(
    ministryHistoryVo: StartMinistryHistoryVo[],
    startDate: Date,
    qr: QueryRunner,
  ): Promise<MinistryHistoryModel[]>;

  validateMinistryEndDates(
    endMinistryHistoryVo: EndMinistryHistoryVo[],
    endDate: Date,
    qr: QueryRunner,
  ): Promise<void>;

  endMinistryHistories(
    endMinistryHistoryVo: EndMinistryHistoryVo[],
    endDate: Date,
    qr: QueryRunner,
  ): Promise<MinistryHistoryModel[]>;

  findCurrentRoleHistory(
    ministryGroupHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<MinistryGroupRoleHistoryModel>;

  startMinistryGroupRoleHistory(
    member: MemberModel,
    ministryGroupHistory: MinistryGroupHistoryModel,
    startDate: Date,
    qr: QueryRunner,
  ): Promise<MinistryGroupDetailHistoryModel>;

  endMinistryGroupRoleHistory(
    currentRoleHistory: MinistryGroupRoleHistoryModel,
    endDate: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
