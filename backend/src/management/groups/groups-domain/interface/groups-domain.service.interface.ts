import { GroupModel } from '../../entity/group.entity';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateGroupDto } from '../../dto/group/create-group.dto';
import { UpdateGroupDto } from '../../dto/group/update-group.dto';
import { GetGroupDto } from '../../dto/group/get-group.dto';

export interface ParentGroup {
  id: number;
  name: string;
  parentGroupId: number | null;
  depth: number;
}

export interface GroupModelWithParentGroups extends GroupModel {
  parentGroups: ParentGroup[];
}

export const IGROUPS_DOMAIN_SERVICE = Symbol('IGROUPS_DOMAIN_SERVICE');

export interface IGroupsDomainService {
  findGroups(
    church: ChurchModel,
    dto: GetGroupDto,
  ): Promise<{ data: GroupModel[]; totalCount: number }>;

  findGroupById(
    church: ChurchModel,
    groupId: number,
    qr?: QueryRunner,
  ): Promise<GroupModel>;

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
  ): Promise<GroupModelWithParentGroups>;

  createGroup(
    church: ChurchModel,
    dto: CreateGroupDto,
    qr: QueryRunner,
  ): Promise<GroupModel>;

  updateGroup(
    church: ChurchModel,
    targetGroup: GroupModel,
    dto: UpdateGroupDto,
    qr: QueryRunner,
    newParentGroup: GroupModel | null,
  ): Promise<GroupModel>;

  deleteGroup(deleteTarget: GroupModel, qr: QueryRunner): Promise<void>;

  findChildGroupIds(group: GroupModel, qr?: QueryRunner): Promise<number[]>;

  incrementMembersCount(group: GroupModel, qr: QueryRunner): Promise<boolean>;

  decrementMembersCount(group: GroupModel, qr: QueryRunner): Promise<boolean>;
}
