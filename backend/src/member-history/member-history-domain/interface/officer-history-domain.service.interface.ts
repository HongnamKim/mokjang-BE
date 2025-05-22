import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetOfficerHistoryDto } from '../../dto/officer/get-officer-history.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { OfficerHistoryModel } from '../../entity/officer-history.entity';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';
import { UpdateOfficerHistoryDto } from '../../dto/officer/update-officer-history.dto';

export const IOFFICER_HISTORY_DOMAIN_SERVICE = Symbol(
  'IOFFICER_HISTORY_DOMAIN_SERVICE',
);

export interface IOfficerHistoryDomainService {
  paginateOfficerHistory(
    church: ChurchModel,
    member: MemberModel,
    dto: GetOfficerHistoryDto,
    qr?: QueryRunner,
  ): Promise<{ officerHistories: OfficerHistoryModel[]; totalCount: number }>;

  findCurrentOfficerHistoryModel(
    member: MemberModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerHistoryModel>,
  ): Promise<OfficerHistoryModel>;

  findOfficerHistoryModelById(
    member: MemberModel,
    officerHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerHistoryModel>,
  ): Promise<OfficerHistoryModel>;

  createOfficerHistory(
    member: MemberModel,
    officer: OfficerModel,
    startDate: Date,
    officerStartChurch: string,
    qr: QueryRunner,
  ): Promise<OfficerHistoryModel>;

  endOfficerHistory(
    officerHistory: OfficerHistoryModel,
    endDate: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateOfficerHistory(
    officerHistory: OfficerHistoryModel,
    dto: UpdateOfficerHistoryDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteOfficerHistory(
    officerHistory: OfficerHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
