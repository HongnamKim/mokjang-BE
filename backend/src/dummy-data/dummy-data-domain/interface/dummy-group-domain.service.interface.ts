import { ChurchModel } from '../../../churches/entity/church.entity';
import { DeleteResult, QueryRunner } from 'typeorm';
import { GroupModel } from '../../../management/groups/entity/group.entity';

export const IDUMMY_GROUP_DOMAIN_SERVICE = Symbol(
  'IDUMMY_GROUP_DOMAIN_SERVICE',
);

export interface IDummyGroupDomainService {
  createDummyGroups(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<{
    maleGroup: GroupModel;
    femaleGroup: GroupModel;
    childGroup: GroupModel;
  }>;

  updateMembersCount(
    values: { group: GroupModel; count: number }[],
    qr: QueryRunner,
  ): Promise<void>;

  deleteDummyGroupsCascade(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<DeleteResult>;
}
