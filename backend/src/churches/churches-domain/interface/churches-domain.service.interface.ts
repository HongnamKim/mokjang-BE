import { ChurchModel } from '../../entity/church.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { CreateChurchDto } from '../../dto/create-church.dto';
import { UpdateChurchDto } from '../../dto/update-church.dto';
import { UserModel } from '../../../user/entity/user.entity';
import { RequestLimitValidationType } from '../../request-info/types/request-limit-validation-result';

export const ICHURCHES_DOMAIN_SERVICE = Symbol('ICHURCHES_DOMAIN_SERVICE');

export interface IChurchesDomainService {
  findAllChurches(): Promise<ChurchModel[]>;

  findChurchById(id: number, qr?: QueryRunner): Promise<ChurchModel>;

  findChurchModelById(id: number, qr?: QueryRunner): Promise<ChurchModel>;

  isExistChurch(id: number, qr?: QueryRunner): Promise<boolean>;

  createChurch(
    user: UserModel,
    dto: CreateChurchDto,
    qr?: QueryRunner,
  ): Promise<ChurchModel>;

  updateChurch(churchId: number, dto: UpdateChurchDto): Promise<ChurchModel>;

  deleteChurchById(id: number, qr?: QueryRunner): Promise<string>;

  updateRequestAttempts(
    church: ChurchModel,
    validationResultType:
      | RequestLimitValidationType.INIT
      | RequestLimitValidationType.INCREASE,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  getChurchManagerIds(churchId: number, qr?: QueryRunner): Promise<number[]>;

  getChurchMainAdminIds(churchId: number, qr?: QueryRunner): Promise<number[]>;
}
