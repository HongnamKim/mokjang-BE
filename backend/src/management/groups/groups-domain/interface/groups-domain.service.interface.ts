import { GroupModel } from '../../entity/group.entity';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { CreateGroupDto } from '../../dto/request/create-group.dto';
import { UpdateGroupNameDto } from '../../dto/request/update-group-name.dto';
import { GetGroupDto } from '../../dto/request/get-group.dto';
import { GroupDomainPaginationResultDto } from '../dto/group-domain-pagination-result.dto';
import { UpdateGroupStructureDto } from '../../dto/request/update-group-structure.dto';
import { MemberModel } from '../../../../members/entity/member.entity';

export interface ParentGroup {
  id: number;
  name: string;
  parentGroupId: number | null;
  depth: number;
}

export interface ChildGroup {
  id: number;
  parentGroupId: number;
  depth: number;
  name: string;
}

export interface GroupModelWithParentGroups extends GroupModel {
  parentGroups: ParentGroup[];
}

export const IGROUPS_DOMAIN_SERVICE = Symbol('IGROUPS_DOMAIN_SERVICE');

export interface IGroupsDomainService {
  findGroups(
    church: ChurchModel,
    dto: GetGroupDto,
  ): Promise<GroupDomainPaginationResultDto>;

  findGroupById(
    church: ChurchModel,
    groupId: number,
    qr?: QueryRunner,
  ): Promise<GroupModel>;

  findGroupModelsByIds(
    church: ChurchModel,
    groupIds: number[],
    qr?: QueryRunner,
    relationsOptions?: FindOptionsRelations<GroupModel>,
  ): Promise<GroupModel[]>;

  findGroupModelById(
    church: ChurchModel,
    groupId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupModel>,
  ): Promise<GroupModel>;

  findParentGroups(
    church: ChurchModel,
    group: GroupModel,
    qr?: QueryRunner,
  ): Promise<ParentGroup[]>;

  findGroupByIdWithParents(
    church: ChurchModel,
    groupId: number,
    qr?: QueryRunner,
  ): Promise<ParentGroup[]>;

  createGroup(
    church: ChurchModel,
    dto: CreateGroupDto,
    qr: QueryRunner,
  ): Promise<GroupModel>;

  updateGroupName(
    church: ChurchModel,
    targetGroup: GroupModel,
    dto: UpdateGroupNameDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateGroupStructure(
    church: ChurchModel,
    targetGroup: GroupModel,
    dto: UpdateGroupStructureDto,
    qr: QueryRunner,
    newParentGroup: GroupModel | null,
  ): Promise<UpdateResult>;

  deleteGroup(deleteTarget: GroupModel, qr: QueryRunner): Promise<void>;

  findChildGroups(group: GroupModel, qr?: QueryRunner): Promise<ChildGroup[]>;

  findGroupAndDescendantsByIds(
    church: ChurchModel,
    rootGroupIds: number[],
    qr?: QueryRunner,
  ): Promise<GroupModel[]>;

  incrementMembersCount(
    group: GroupModel,
    count: number,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementMembersCount(
    group: GroupModel,
    count: number,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  refreshMembersCount(
    group: GroupModel,
    membersCount: number,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  countAllGroups(church: ChurchModel, qr: QueryRunner): Promise<number>;

  updateGroupLeader(
    group: GroupModel,
    newLeaderMember: MemberModel | null,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  removeGroupLeader(
    groups: GroupModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  getGroupNameWithHierarchy(
    church: ChurchModel,
    group: GroupModel,
    qr?: QueryRunner,
  ): Promise<string>;
}
