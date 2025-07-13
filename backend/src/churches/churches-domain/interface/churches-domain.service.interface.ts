import { ChurchModel, ManagementCountType } from '../../entity/church.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { CreateChurchDto } from '../../dto/create-church.dto';
import { UpdateChurchDto } from '../../dto/update-church.dto';
import { RequestLimitValidationType } from '../../../request-info/types/request-limit-validation-result';
import { UserModel } from '../../../user/entity/user.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

export const ICHURCHES_DOMAIN_SERVICE = Symbol('ICHURCHES_DOMAIN_SERVICE');

export interface IChurchesDomainService {
  findAllChurches(): Promise<ChurchModel[]>;

  findChurchById(id: number, qr?: QueryRunner): Promise<ChurchModel>;

  findChurchModelByJoinCode(
    joinCode: string,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchModel>,
  ): Promise<ChurchModel>;

  findChurchModelById(
    id: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchModel>,
  ): Promise<ChurchModel>;

  isExistChurch(id: number, qr?: QueryRunner): Promise<boolean>;

  createChurch(
    dto: CreateChurchDto,
    ownerUser: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchModel>;

  updateChurch(church: ChurchModel, dto: UpdateChurchDto): Promise<ChurchModel>;

  deleteChurch(church: ChurchModel, qr?: QueryRunner): Promise<string>;

  updateRequestAttempts(
    church: ChurchModel,
    validationResultType:
      | RequestLimitValidationType.INIT
      | RequestLimitValidationType.INCREASE,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  getChurchManagerIds(churchId: number, qr?: QueryRunner): Promise<number[]>;

  getChurchOwnerIds(churchId: number, qr?: QueryRunner): Promise<number[]>;

  updateChurchJoinCode(
    church: ChurchModel,
    newCode: string,
    qr: QueryRunner | undefined,
  ): Promise<UpdateResult>;

  // -------교인 수 업데이트---------
  incrementMemberCount(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementMemberCount(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
  // -------교인 수 업데이트---------

  transferOwner(
    church: ChurchModel,
    newOwnerChurchUser: ChurchUserModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  incrementManagementCount(
    church: ChurchModel,
    countType: ManagementCountType,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementManagementCount(
    church: ChurchModel,
    countType: ManagementCountType,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  refreshManagementCount(
    church: ChurchModel,
    countType: ManagementCountType,
    refreshCount: number,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
