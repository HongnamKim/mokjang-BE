import { MemberModel } from '../../../members/entity/member.entity';
import { GetMinistryHistoryDto } from '../../dto/ministry/get-ministry-history.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { MinistryHistoryModel } from '../../entity/ministry-history.entity';
import { MinistryModel } from '../../../management/ministries/entity/ministry.entity';
import { UpdateMinistryHistoryDto } from '../../dto/ministry/update-ministry-history.dto';

export const IMINISTRY_HISTORY_DOMAIN_SERVICE = Symbol(
  'IMINISTRY_HISTORY_DOMAIN_SERVICE',
);

export interface IMinistryHistoryDomainService {
  paginateMinistryHistory(
    member: MemberModel,
    dto: GetMinistryHistoryDto,
    qr?: QueryRunner,
  ): Promise<{ ministryHistories: MinistryHistoryModel[]; totalCount: number }>;

  findMinistryHistoryModelById(
    member: MemberModel,
    ministryHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryHistoryModel>,
  ): Promise<MinistryHistoryModel>;

  createMinistryHistory(
    member: MemberModel,
    ministry: MinistryModel,
    startDate: Date,
    qr: QueryRunner,
  ): Promise<MinistryHistoryModel>;

  endMinistryHistory(
    ministryHistory: MinistryHistoryModel,
    snapShot: {
      ministrySnapShot: string;
      ministryGroupSnapShot: string | null;
    },
    endDate: Date,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  updateMinistryHistory(
    ministryHistory: MinistryHistoryModel,
    dto: UpdateMinistryHistoryDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteMinistryHistory(
    ministryHistory: MinistryHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
