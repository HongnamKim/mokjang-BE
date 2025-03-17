import { ChurchModel } from '../../../../churches/entity/church.entity';
import { GetMinistryDto } from '../../dto/get-ministry.dto';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { MinistryModel } from '../../entity/ministry.entity';
import { CreateMinistryDto } from '../../dto/create-ministry.dto';
import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import { UpdateMinistryDto } from '../../dto/update-ministry.dto';

export const IMINISTRIES_DOMAIN_SERVICE = Symbol('IMINISTRIES_DOMAIN_SERVICE');

export interface IMinistriesDomainService {
  findMinistries(
    church: ChurchModel,
    dto: GetMinistryDto,
    qr?: QueryRunner,
  ): Promise<MinistryModel[]>;

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

  createMinistry(
    church: ChurchModel,
    dto: CreateMinistryDto,
    qr?: QueryRunner,
    ministryGroup?: MinistryGroupModel,
  ): Promise<MinistryModel>;

  updateMinistry(
    church: ChurchModel,
    targetMinistry: MinistryModel,
    dto: UpdateMinistryDto,
    qr: QueryRunner,
    newMinistryGroup?: MinistryGroupModel,
  ): Promise<MinistryModel>;

  deleteMinistry(ministry: MinistryModel, qr?: QueryRunner): Promise<string>;

  incrementMembersCount(
    ministry: MinistryModel,
    qr: QueryRunner,
  ): Promise<boolean>;

  decrementMembersCount(
    ministry: MinistryModel,
    qr: QueryRunner,
  ): Promise<boolean>;
}
