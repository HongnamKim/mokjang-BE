import { MinistryGroupRoleHistoryModel } from '../../../entity/child/ministry-group-role-history.entity';

export class PatchMinistryGroupRoleHistoryResponseDto {
  constructor(
    public readonly data: MinistryGroupRoleHistoryModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
