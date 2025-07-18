import { ChurchModel } from '../../../../churches/entity/church.entity';
import { GetMinistryDto } from '../../dto/ministry/get-ministry.dto';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { MinistryModel } from '../../entity/ministry.entity';
import { CreateMinistryDto } from '../../dto/ministry/create-ministry.dto';
import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import { UpdateMinistryDto } from '../../dto/ministry/update-ministry.dto';
import { MinistryDomainPaginationResponseDto } from '../../dto/ministry/response/ministry-domain-pagination-response.dto';

export const IMINISTRIES_DOMAIN_SERVICE = Symbol('IMINISTRIES_DOMAIN_SERVICE');

export interface IMinistriesDomainService {
  findMinistries(
    church: ChurchModel,
    dto: GetMinistryDto,
    qr?: QueryRunner,
  ): Promise<MinistryDomainPaginationResponseDto>;

  findMinistryModelById(
    church: ChurchModel,
    ministryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryModel>,
  ): Promise<MinistryModel>;

  findMinistryById(
    church: ChurchModel,
    ministryId: number,
    qr?: QueryRunner,
  ): Promise<MinistryModel>;

  findMinistriesByIds(
    church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    ministryIds: number[],
    qr?: QueryRunner,
  ): Promise<MinistryModel[]>;

  createMinistry(
    church: ChurchModel,
    dto: CreateMinistryDto,
    ministryGroup: MinistryGroupModel | null,
    qr?: QueryRunner,
  ): Promise<MinistryModel>;

  updateMinistry(
    church: ChurchModel,
    targetMinistry: MinistryModel,
    dto: UpdateMinistryDto,
    qr: QueryRunner,
    newMinistryGroup?: MinistryGroupModel | null,
  ): Promise<MinistryModel>;

  deleteMinistry(ministry: MinistryModel, qr?: QueryRunner): Promise<void>;

  incrementMembersCount(
    ministry: MinistryModel,
    qr: QueryRunner,
  ): Promise<boolean>;

  decrementMembersCount(
    ministry: MinistryModel,
    qr: QueryRunner,
  ): Promise<boolean>;

  refreshMembersCount(
    ministry: MinistryModel,
    membersCount: number,
    qr?: QueryRunner,
  ): Promise<MinistryModel>;

  countAllMinistries(church: ChurchModel, qr: QueryRunner): Promise<number>;
}
