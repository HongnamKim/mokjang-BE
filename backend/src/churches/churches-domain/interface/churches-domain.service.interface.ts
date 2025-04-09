import { ChurchModel } from '../../entity/church.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { CreateChurchDto } from '../../dto/create-church.dto';
import { UpdateChurchDto } from '../../dto/update-church.dto';
import { RequestLimitValidationType } from '../../../request-info/types/request-limit-validation-result';

export const ICHURCHES_DOMAIN_SERVICE = Symbol('ICHURCHES_DOMAIN_SERVICE');

export interface IChurchesDomainService {
  findAllChurches(): Promise<ChurchModel[]>;

  findChurchById(id: number, qr?: QueryRunner): Promise<ChurchModel>;

  findChurchModelById(
    id: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<ChurchModel>,
  ): Promise<ChurchModel>;

  isExistChurch(id: number, qr?: QueryRunner): Promise<boolean>;

  createChurch(dto: CreateChurchDto, qr?: QueryRunner): Promise<ChurchModel>;

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

  getChurchMainAdminIds(churchId: number, qr?: QueryRunner): Promise<number[]>;
}
