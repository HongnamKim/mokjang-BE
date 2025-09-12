import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetWorshipsDto } from '../../dto/request/worship/get-worships.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { WorshipDomainPaginationResultDto } from '../dto/worship-domain-pagination-result.dto';
import { WorshipModel } from '../../entity/worship.entity';
import { CreateWorshipDto } from '../../dto/request/worship/create-worship.dto';
import { UpdateWorshipDto } from '../../dto/request/worship/update-worship.dto';
import { MemberModel } from '../../../members/entity/member.entity';

export const IWORSHIP_DOMAIN_SERVICE = Symbol('IWORSHIP_DOMAIN_SERVICE');

export interface IWorshipDomainService {
  findWorships(
    church: ChurchModel,
    dto: GetWorshipsDto,
    qr?: QueryRunner,
  ): Promise<WorshipDomainPaginationResultDto>;

  findAllWorships(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<WorshipModel[]>;

  findWorshipById(
    church: ChurchModel,
    worshipId: number,
    qr?: QueryRunner,
  ): Promise<WorshipModel>;

  findWorshipModelById(
    church: ChurchModel,
    worshipId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<WorshipModel>,
  ): Promise<WorshipModel>;

  createWorship(
    church: ChurchModel,
    dto: CreateWorshipDto,
    qr: QueryRunner,
  ): Promise<WorshipModel>;

  updateWorship(
    church: ChurchModel,
    targetWorship: WorshipModel,
    dto: UpdateWorshipDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteWorship(
    targetWorship: WorshipModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  countAllWorships(church: ChurchModel, qr: QueryRunner): Promise<number>;

  findAvailableWorships(
    member: MemberModel,
    targetGroupIds: number[] | undefined,
  ): Promise<WorshipModel[]>;

  findBulkWorshipByDay(
    targetWorshipDay: number,
    bulkSize: number,
    cursor: number,
  ): Promise<WorshipModel[]>;
}
