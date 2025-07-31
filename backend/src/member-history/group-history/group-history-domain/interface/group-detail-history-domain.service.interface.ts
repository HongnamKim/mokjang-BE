import { MemberModel } from '../../../../members/entity/member.entity';
import { GroupHistoryModel } from '../../entity/group-history.entity';
import { GroupRole } from '../../../../management/groups/const/group-role.enum';
import { QueryRunner, UpdateResult } from 'typeorm';
import { GroupDetailHistoryModel } from '../../entity/group-detail-history.entity';
import { GetGroupHistoryDto } from '../../dto/request/get-group-history.dto';
import { HistoryUpdateDate } from '../../../history-date.utils';

export const IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE = Symbol(
  'IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE',
);

export interface IGroupDetailHistoryDomainService {
  paginateDetailHistories(
    groupHistory: GroupHistoryModel,
    dto: GetGroupHistoryDto,
    qr?: QueryRunner,
  ): Promise<GroupDetailHistoryModel[]>;

  findGroupDetailHistoryModelById(
    groupHistory: GroupHistoryModel,
    detailId: number,
    qr?: QueryRunner,
  ): Promise<GroupDetailHistoryModel>;

  findCurrentGroupDetailHistory(
    member: MemberModel,
    groupHistory: GroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<GroupDetailHistoryModel>;

  startGroupDetailHistory(
    member: MemberModel,
    groupHistory: GroupHistoryModel,
    groupRole: GroupRole,
    startDate: Date,
    qr?: QueryRunner,
  ): Promise<GroupDetailHistoryModel>;

  validateGroupRoleEndDates(
    leaderMembers: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
  ): Promise<void>;

  endGroupDetailHistory(
    oldLeaderMembers: MemberModel[],
    date: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateDetailHistory(
    targetHistory: GroupDetailHistoryModel,
    historyDateUpdateValue: HistoryUpdateDate,
    qr: QueryRunner | undefined,
  ): Promise<UpdateResult>;

  deleteDetailHistory(
    targetHistory: GroupDetailHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
