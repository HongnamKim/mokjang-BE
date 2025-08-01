import { ChurchModel } from '../../../../churches/entity/church.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { OfficerModel } from '../../entity/officer.entity';
import { CreateOfficerDto } from '../../dto/request/create-officer.dto';
import { UpdateOfficerNameDto } from '../../dto/request/update-officer-name.dto';
import { GetOfficersDto } from '../../dto/request/get-officers.dto';
import { OfficerDomainPaginationResultDto } from '../../dto/officer-domain-pagination-result.dto';

export const IOFFICERS_DOMAIN_SERVICE = Symbol('IOFFICERS_DOMAIN_SERVICE');

export interface IOfficersDomainService {
  findOfficers(
    church: ChurchModel,
    dto: GetOfficersDto,
    qr?: QueryRunner,
  ): Promise<OfficerDomainPaginationResultDto>;

  findOfficerById(
    church: ChurchModel,
    officerId: number,
    qr?: QueryRunner,
  ): Promise<OfficerModel>;

  findOfficerModelById(
    church: ChurchModel,
    officerId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerModel>,
  ): Promise<OfficerModel>;

  createOfficer(
    church: ChurchModel,
    dto: CreateOfficerDto,
    qr: QueryRunner,
  ): Promise<OfficerModel>;

  updateOfficerName(
    church: ChurchModel,
    officer: OfficerModel,
    dto: UpdateOfficerNameDto,
    qr?: QueryRunner,
  ): Promise<OfficerModel>;

  updateOfficerStructure(
    church: ChurchModel,
    targetOfficer: OfficerModel,
    order: number,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteOfficer(officer: OfficerModel, qr?: QueryRunner): Promise<void>;

  incrementMembersCount(
    officer: OfficerModel,
    count: number,
    qr: QueryRunner,
  ): Promise<boolean>;

  decrementMembersCount(
    officer: OfficerModel,
    count: number,
    qr: QueryRunner,
  ): Promise<boolean>;

  countAllOfficers(church: ChurchModel, qr: QueryRunner): Promise<number>;
}
