import { MemberModel } from '../../../../members/entity/member.entity';
import { GetMinistryHistoriesDto } from '../../dto/request/ministry/get-ministry-histories.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MinistryHistoryModel } from '../../entity/ministry-history.entity';
import { StartMinistryHistoryVo } from '../../dto/start-ministry-history.vo';
import { EndMinistryHistoryVo } from '../../dto/end-ministry-history.vo';
import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';
import { HistoryUpdateDate } from '../../../history-date.utils';

export const IMINISTRY_HISTORY_DOMAIN_SERVICE = Symbol(
  'IMINISTRY_HISTORY_DOMAIN_SERVICE',
);

export interface IMinistryHistoryDomainService {
  paginateMinistryHistory(
    member: MemberModel,
    ministryGroupHistory: MinistryGroupHistoryModel,
    dto: GetMinistryHistoriesDto,
    qr?: QueryRunner,
  ): Promise<MinistryHistoryModel[]>;

  findMinistryHistoryModelById(
    member: MemberModel,
    ministryGroupHistory: MinistryGroupHistoryModel,
    ministryHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryHistoryModel>,
  ): Promise<MinistryHistoryModel>;

  startMinistryHistories(
    ministryHistoryVo: StartMinistryHistoryVo[],
    qr: QueryRunner,
  ): Promise<MinistryHistoryModel[]>;

  endMinistryHistories(
    endMinistryHistoryVo: EndMinistryHistoryVo[],
    qr: QueryRunner,
  ): Promise<MinistryHistoryModel[]>;

  updateMinistryHistory(
    ministryHistory: MinistryHistoryModel,
    //dto: UpdateMinistryHistoryDto,
    historyDate: HistoryUpdateDate,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteMinistryHistory(
    ministryHistory: MinistryHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
