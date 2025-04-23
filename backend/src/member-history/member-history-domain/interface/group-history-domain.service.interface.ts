import { MemberModel } from '../../../members/entity/member.entity';
import { GetGroupHistoryDto } from '../../dto/group/get-group-history.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { GroupHistoryModel } from '../../entity/group-history.entity';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { GroupRoleModel } from '../../../management/groups/entity/group-role.entity';
import { UpdateGroupHistoryDto } from '../../dto/group/update-group-history.dto';

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

  createGroupHistory(
    member: MemberModel,
    group: GroupModel,
    groupRole: GroupRoleModel | undefined,
    startDate: Date,
    qr: QueryRunner,
  ): Promise<GroupHistoryModel>;

  endGroupHistory(
    groupHistory: GroupHistoryModel,
    snapShot: {
      groupSnapShot: string;
      groupRoleSnapShot: string | null;
    },
    endDate: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateGroupHistory(
    groupHistory: GroupHistoryModel,
    dto: UpdateGroupHistoryDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteGroupHistory(
    groupHistory: GroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
