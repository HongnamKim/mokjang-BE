import { ChurchModel } from '../../../../churches/entity/church.entity';
import { GetMinistryDto } from '../../dto/ministry/request/get-ministry.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MinistryModel } from '../../entity/ministry.entity';
import { CreateMinistryDto } from '../../dto/ministry/request/create-ministry.dto';
import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import { UpdateMinistryDto } from '../../dto/ministry/request/update-ministry.dto';
import { MemberModel } from '../../../../members/entity/member.entity';

export const IMINISTRIES_DOMAIN_SERVICE = Symbol('IMINISTRIES_DOMAIN_SERVICE');

export interface IMinistriesDomainService {
  findMinistries(
    church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    dto: GetMinistryDto,
    qr?: QueryRunner,
  ): Promise<MinistryModel[]>;

  findMinistryModelById(
    //church: ChurchModel,
    ministryGroup: MinistryGroupModel,
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
    targetMinistry: MinistryModel,
    dto: UpdateMinistryDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

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

  countMinistriesInMinistryGroup(
    church: ChurchModel,
    ministryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<number>;

  assignMemberToMinistry(
    member: MemberModel,
    oldMinistry: MinistryModel[],
    newMinistry: MinistryModel,
    qr: QueryRunner,
  ): Promise<void>;

  removeMemberFromMinistry(
    member: MemberModel,
    ministry: MinistryModel,
    qr: QueryRunner,
  ): Promise<void>;
}
