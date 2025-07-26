import { MemberModel } from '../../../../members/entity/member.entity';
import { GroupHistoryModel } from '../../entity/group-history.entity';
import { GroupRole } from '../../../../management/groups/const/group-role.enum';
import { QueryRunner, UpdateResult } from 'typeorm';
import { GroupDetailHistoryModel } from '../../entity/group-detail-history.entity';

export const IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE = Symbol(
  'IGROUP_DETAIL_HISTORY_DOMAIN_SERVICE',
);

export interface IGroupDetailHistoryDomainService {
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

  endGroupDetailHistory(
    oldLeaderMembers: MemberModel[],
    date: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
