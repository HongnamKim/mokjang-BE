import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { CreateMinistryGroupDto } from '../../dto/ministry-group/create-ministry-group.dto';
import { UpdateMinistryGroupNameDto } from '../../dto/ministry-group/update-ministry-group-name.dto';
import { GetMinistryGroupDto } from '../../dto/ministry-group/get-ministry-group.dto';
import { MinistryGroupDomainPaginationResponseDto } from '../../dto/ministry-group/response/ministry-group-domain-pagination-response.dto';
import { UpdateMinistryGroupStructureDto } from '../../dto/ministry-group/update-ministry-group-structure.dto';

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
  ): Promise<MinistryGroupDomainPaginationResponseDto>;

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
  ): Promise<MinistryGroupWithParentGroups>;

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
  ): Promise<MinistryGroupWithParentGroups>;

  deleteMinistryGroup(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<void>;
}
