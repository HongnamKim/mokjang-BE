import { ChurchModel } from '../../../../churches/entity/church.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GetOfficerHistoryDto } from '../../dto/request/get-officer-history.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { OfficerHistoryModel } from '../../entity/officer-history.entity';
import { OfficerModel } from '../../../../management/officers/entity/officer.entity';
import { HistoryUpdateDate } from '../../../history-date.utils';

export const IOFFICER_HISTORY_DOMAIN_SERVICE = Symbol(
  'IOFFICER_HISTORY_DOMAIN_SERVICE',
);

export interface IOfficerHistoryDomainService {
  paginateOfficerHistory(
    church: ChurchModel,
    member: MemberModel,
    dto: GetOfficerHistoryDto,
    qr?: QueryRunner,
  ): Promise<OfficerHistoryModel[]>;

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

  startOfficerHistory(
    members: MemberModel[],
    officer: OfficerModel,
    startDate: Date,
    qr: QueryRunner,
  ): Promise<OfficerHistoryModel[]>;

  validateOfficerEndDates(
    members: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
  ): Promise<void>;

  endOfficerHistories(
    members: MemberModel[],
    endDate: Date,
    qr: QueryRunner,
    officer?: OfficerModel,
  ): Promise<OfficerHistoryModel[] | UpdateResult>;

  updateOfficerHistory(
    officerHistory: OfficerHistoryModel,
    historyDate: HistoryUpdateDate,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteOfficerHistory(
    officerHistory: OfficerHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
