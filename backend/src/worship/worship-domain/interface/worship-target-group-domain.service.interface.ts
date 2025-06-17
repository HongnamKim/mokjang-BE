import { WorshipModel } from '../../entity/worship.entity';
import { WorshipTargetGroupModel } from '../../entity/worship-target-group.entity';
import { DeleteResult, QueryRunner } from 'typeorm';
import { GroupModel } from '../../../management/groups/entity/group.entity';

export const IWORSHIP_TARGET_GROUP_DOMAIN_SERVICE = Symbol(
  'IWORSHIP_TARGET_GROUP_DOMAIN_SERVICE',
);

export interface IWorshipTargetGroupDomainService {
  createWorshipTargetGroup(
    worship: WorshipModel,
    targetGroups: GroupModel[],
    qr: QueryRunner,
  ): Promise<WorshipTargetGroupModel[]>;

  deleteWorshipTargetGroup(
    worship: WorshipModel,
    targetGroupIds: number[],
    qr?: QueryRunner,
  ): Promise<DeleteResult>;

  deleteWorshipTargetGroupCascade(
    targetWorship: WorshipModel,
    qr: QueryRunner,
  ): Promise<DeleteResult>;
}
