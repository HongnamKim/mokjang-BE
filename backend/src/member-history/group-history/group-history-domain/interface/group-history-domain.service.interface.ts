import { MemberModel } from '../../../../members/entity/member.entity';
import { GetGroupHistoryDto } from '../../dto/get-group-history.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { GroupHistoryModel } from '../../entity/group-history.entity';

export const IGROUP_HISTORY_DOMAIN_SERVICE = Symbol(
  'IGROUP_HISTORY_DOMAIN_SERVICE',
);

export interface IGroupHistoryDomainService {
  paginateGroupHistory(
    member: MemberModel,
    dto: GetGroupHistoryDto,
    qr?: QueryRunner,
  ): Promise<{ groupHistories: GroupHistoryModel[]; totalCount: number }>;

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

  /*createGroupHistory(
    member: MemberModel,
    group: GroupModel,
    groupRole: GroupRole,
    startDate: Date,
    qr: QueryRunner,
  ): Promise<GroupHistoryModel>;

  endGroupHistory(
    groupHistory: GroupHistoryModel,
    groupSnapShot: string,
    endDate: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult>;*/

  updateGroupHistory(
    groupHistory: GroupHistoryModel,
    startDate: Date | undefined,
    endDate: Date | undefined,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteGroupHistory(
    groupHistory: GroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
