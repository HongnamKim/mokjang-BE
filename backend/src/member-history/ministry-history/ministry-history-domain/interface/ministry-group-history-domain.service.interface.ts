import { MinistryGroupModel } from '../../../../management/ministries/entity/ministry-group.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';

export const IMINISTRY_GROUP_HISTORY_DOMAIN_SERVICE = Symbol(
  'IMINISTRY_GROUP_DOMAIN_SERVICE',
);

export interface IMinistryGroupHistoryDomainService {
  paginateMinistryGroupHistories(
    member: MemberModel,
    qr?: QueryRunner,
  ): Promise<MinistryGroupHistoryModel[]>;

  startMinistryGroupHistories(
    ministryGroup: MinistryGroupModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<MinistryGroupHistoryModel[]>;

  endMinistryGroupHistories(
    ministryGroup: MinistryGroupModel,
    ministryGroupSnapShot: string,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findCurrentMinistryGroupHistory(
    member: MemberModel,
    ministryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<MinistryGroupHistoryModel>;
}
