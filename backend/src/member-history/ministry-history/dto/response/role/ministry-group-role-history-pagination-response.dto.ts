import { MinistryGroupRoleHistoryModel } from '../../../entity/ministry-group-role-history.entity';

export class MinistryGroupRoleHistoryPaginationResponseDto {
  constructor(
    public readonly data: MinistryGroupRoleHistoryModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
