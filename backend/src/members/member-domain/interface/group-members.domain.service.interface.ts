import { ChurchModel } from '../../../churches/entity/church.entity';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { GetGroupMembersDto } from '../../../management/groups/dto/request/members/get-group-members.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MemberModel } from '../../entity/member.entity';

export const IGROUP_MEMBERS_DOMAIN_SERVICE = Symbol(
  'IGROUP_MEMBERS_DOMAIN_SERVICE',
);

export interface IGroupMembersDomainService {
  findGroupMembers(
    church: ChurchModel,
    group: GroupModel,
    dto: GetGroupMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;

  findGroupMembersByIds(
    church: ChurchModel,
    group: GroupModel,
    memberIds: number[],
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MemberModel>,
  ): Promise<MemberModel[]>;

  assignGroup(
    members: MemberModel[],
    group: GroupModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  removeGroup(members: MemberModel[], qr: QueryRunner): Promise<UpdateResult>;

  countAllMembers(
    church: ChurchModel,
    group: GroupModel,
    qr?: QueryRunner,
  ): Promise<number>;
}
