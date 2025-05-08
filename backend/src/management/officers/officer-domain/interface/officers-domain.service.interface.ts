import { ChurchModel } from '../../../../churches/entity/church.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { OfficerModel } from '../../entity/officer.entity';
import { CreateOfficerDto } from '../../dto/create-officer.dto';
import { UpdateOfficerDto } from '../../dto/update-officer.dto';
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

  updateOfficer(
    church: ChurchModel,
    officer: OfficerModel,
    dto: UpdateOfficerDto,
    qr?: QueryRunner,
  ): Promise<OfficerModel>;

  deleteOfficer(officer: OfficerModel, qr?: QueryRunner): Promise<void>;

  incrementMembersCount(
    officer: OfficerModel,
    qr: QueryRunner,
  ): Promise<boolean>;

  decrementMembersCount(
    officer: OfficerModel,
    qr: QueryRunner,
  ): Promise<boolean>;
}
