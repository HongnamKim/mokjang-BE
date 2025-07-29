import { MemberModel } from '../../../../members/entity/member.entity';
import { GetGroupHistoryDto } from '../../dto/request/get-group-history.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { GroupHistoryModel } from '../../entity/group-history.entity';
import { GroupModel } from '../../../../management/groups/entity/group.entity';
import { HistoryUpdateDate } from '../../../history-date.utils';

export const IGROUP_HISTORY_DOMAIN_SERVICE = Symbol(
  'IGROUP_HISTORY_DOMAIN_SERVICE',
);

export interface IGroupHistoryDomainService {
  paginateGroupHistory(
    member: MemberModel,
    dto: GetGroupHistoryDto,
    qr?: QueryRunner,
  ): Promise<GroupHistoryModel[]>;

  startGroupHistories(
    members: MemberModel[],
    group: GroupModel,
    startDate: Date,
    qr: QueryRunner,
  ): Promise<GroupHistoryModel[]>;

  validateGroupStartDates(
    members: MemberModel[],
    newStartDate: Date,
    qr: QueryRunner,
  ): Promise<void>;

  endCurrentGroupHistory(
    member: MemberModel,
    groupSnapShot: string,
    endDate: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult | void>;

  endGroupHistories(
    members: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
    group?: GroupModel,
    groupSnapShot?: string,
  ): Promise<GroupHistoryModel[] | UpdateResult>;

  findCurrentGroupHistoryModel(
    member: MemberModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupHistoryModel>,
  ): Promise<GroupHistoryModel>;

  findGroupHistoryModelById(
    member: MemberModel,
    groupHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupHistoryModel>,
  ): Promise<GroupHistoryModel>;

  updateGroupHistory(
    groupHistory: GroupHistoryModel,
    historyDate: HistoryUpdateDate,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteGroupHistory(
    groupHistory: GroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
