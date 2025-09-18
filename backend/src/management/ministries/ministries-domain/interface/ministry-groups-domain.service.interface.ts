import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { CreateMinistryGroupDto } from '../../dto/ministry-group/request/create-ministry-group.dto';
import { UpdateMinistryGroupNameDto } from '../../dto/ministry-group/request/update-ministry-group-name.dto';
import { GetMinistryGroupDto } from '../../dto/ministry-group/request/get-ministry-group.dto';
import { UpdateMinistryGroupStructureDto } from '../../dto/ministry-group/request/update-ministry-group-structure.dto';
import { MemberModel } from '../../../../members/entity/member.entity';

export const IMINISTRY_GROUPS_DOMAIN_SERVICE = Symbol(
  'IMINISTRY_GROUPS_DOMAIN_SERVICE',
);

export interface ParentMinistryGroup {
  id: number;
  name: string;
  parentMinistryGroupId: number | null;
  depth: number;
}

export interface MinistryGroupWithParentGroups extends MinistryGroupModel {
  parentMinistryGroups: ParentMinistryGroup[];
}

export interface IMinistryGroupsDomainService {
  findMinistryGroups(
    church: ChurchModel,
    parentMinistryGroup: MinistryGroupModel | null,
    dto: GetMinistryGroupDto,
    qr?: QueryRunner,
  ): Promise<MinistryGroupModel[]>;

  findMinistryGroupModelById(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupModel>,
  ): Promise<MinistryGroupModel>;

  findMinistryGroupById(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ): Promise<MinistryGroupModel>; //Promise<MinistryGroupWithParentGroups>;

  findParentMinistryGroups(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ): Promise<ParentMinistryGroup[]>;

  findChildMinistryGroups(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ): Promise<number[]>;

  createMinistryGroup(
    church: ChurchModel,
    parentMinistryGroup: MinistryGroupModel | null,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ): Promise<MinistryGroupModel>;

  updateMinistryGroupName(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    dto: UpdateMinistryGroupNameDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateMinistryGroupStructure(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    dto: UpdateMinistryGroupStructureDto,
    qr: QueryRunner,
    newParentMinistryGroup: MinistryGroupModel | null,
  ): Promise<UpdateResult>;

  deleteMinistryGroup(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<void>;

  countAllMinistryGroups(church: ChurchModel, qr: QueryRunner): Promise<number>;

  addMembersToMinistryGroup(
    ministryGroup: MinistryGroupModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<void>;

  removeMembersFromMinistryGroup(
    ministryGroup: MinistryGroupModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<void>;

  updateMembersCount(
    ministryGroup: MinistryGroupModel,
    count: number,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateMinistryGroupLeader(
    ministryGroup: MinistryGroupModel,
    newLeaderMember: MemberModel | null,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  incrementMinistriesCount(
    ministryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementMinistriesCount(
    ministryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  refreshMinistryCount(
    ministryGroup: MinistryGroupModel,
    ministryCount: number,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  getMinistryGroupNameWithHierarchy(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ): Promise<string>;

  findMinistryGroupsByLeaderMember(
    member: MemberModel,
    qr?: QueryRunner,
  ): Promise<MinistryGroupModel[]>;
}
