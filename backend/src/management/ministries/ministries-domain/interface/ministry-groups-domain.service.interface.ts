import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateMinistryGroupDto } from '../../dto/create-ministry-group.dto';
import { UpdateMinistryGroupDto } from '../../dto/update-ministry-group.dto';

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
  ): Promise<MinistryGroupWithParentGroups>;

  findParentMinistryGroups(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ): Promise<ParentMinistryGroup[]>;

  findChildMinistryGroupIds(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ): Promise<number[]>;

  createMinistryGroup(
    church: ChurchModel,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ): Promise<MinistryGroupModel>;

  updateMinistryGroup(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    dto: UpdateMinistryGroupDto,
    qr: QueryRunner,
    newParentMinistryGroup: MinistryGroupModel | null,
  ): Promise<MinistryGroupWithParentGroups>;

  deleteMinistryGroup(
    church: ChurchModel,
    ministryGroupId: number,
    qr: QueryRunner,
  ): Promise<string>;
}
