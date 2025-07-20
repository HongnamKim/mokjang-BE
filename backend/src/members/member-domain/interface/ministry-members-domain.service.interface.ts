import { MinistryGroupModel } from '../../../management/ministries/entity/ministry-group.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { MemberModel } from '../../entity/member.entity';
import { GetMinistryGroupMembersDto } from '../../../management/ministries/dto/ministry-group/request/member/get-ministry-group-members.dto';
import { GroupRole } from '../../../management/groups/const/group-role.enum';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetUnassignedMembersDto } from '../../../management/ministries/dto/ministry-group/request/member/get-unassigned-members.dto';
import { SearchMembersForMinistryGroupDto } from '../../../management/ministries/dto/ministry-group/request/member/search-members-for-ministry-group.dto';

export const IMINISTRY_MEMBERS_DOMAIN_SERVICE = Symbol(
  'IMINISTRY_MEMBERS_DOMAIN_SERVICE',
);

export interface IMinistryMembersDomainService {
  findUnassignedMembers(
    church: ChurchModel,
    dto: GetUnassignedMembersDto,
  ): Promise<MemberModel[]>;

  searchMembersForMinistryGroup(
    church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    dto: SearchMembersForMinistryGroupDto,
  ): Promise<MemberModel[]>;

  findMinistryGroupMembers(
    ministryGroup: MinistryGroupModel,
    dto: GetMinistryGroupMembersDto,
  ): Promise<MemberModel[]>;

  findMinistryGroupMembersByIds(
    ministryGroup: MinistryGroupModel,
    memberIds: number[],
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;

  updateMinistryGroupRole(
    members: MemberModel[],
    ministryGroupRole: GroupRole,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findMinistryGroupMemberModelById(
    ministryGroup: MinistryGroupModel,
    memberId: number,
    qr?: QueryRunner,
  ): Promise<MemberModel>;

  findMinistryGroupMemberById(
    ministryGroup: MinistryGroupModel,
    memberId: number,
    qr?: QueryRunner,
  ): Promise<MemberModel>;
}
