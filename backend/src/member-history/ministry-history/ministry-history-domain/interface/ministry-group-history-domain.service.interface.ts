import { MinistryGroupModel } from '../../../../management/ministries/entity/ministry-group.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';
import { GetMinistryGroupHistoriesDto } from '../../dto/request/group/get-ministry-group-histories.dto';
import { HistoryUpdateDate } from '../../../history-date.utils';
import { GetMinistryGroupHistoryListDto } from '../../dto/request/group/get-ministry-group-history-list.dto';
import { DomainCursorPaginationResultDto } from '../../../../common/dto/domain-cursor-pagination-result.dto';

export const IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE = Symbol(
  'IMINISTRY_GROUP_DOMAIN_SERVICE',
);

export interface IMinistryGroupHistoryDomainService {
  paginateMinistryGroupHistories(
    member: MemberModel,
    dto: GetMinistryGroupHistoriesDto,
    qr?: QueryRunner,
  ): Promise<MinistryGroupHistoryModel[]>;

  findCurrentMinistryGroupHistory(
    member: MemberModel,
    ministryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<MinistryGroupHistoryModel>;

  findCurrentMinistryGroupHistoryList(
    member: MemberModel,
    dto: GetMinistryGroupHistoryListDto,
  ): Promise<DomainCursorPaginationResultDto<MinistryGroupHistoryModel>>;

  findMinistryGroupHistoryModelById(
    member: MemberModel,
    ministryGroupHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupHistoryModel>,
  ): Promise<MinistryGroupHistoryModel>;

  startMinistryGroupHistories(
    ministryGroup: MinistryGroupModel,
    members: MemberModel[],
    startDate: Date,
    qr: QueryRunner,
  ): Promise<MinistryGroupHistoryModel[]>;

  validateEndDates(
    members: MemberModel[],
    ministryGroup: MinistryGroupModel,
    endDate: Date,
    qr: QueryRunner,
  ): Promise<void>;

  endMinistryGroupHistories(
    ministryGroup: MinistryGroupModel,
    ministryGroupSnapShot: string,
    members: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateMinistryGroupHistory(
    targetHistory: MinistryGroupHistoryModel,
    historyDate: HistoryUpdateDate,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteMinistryGroupHistory(
    targetHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
