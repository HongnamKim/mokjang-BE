import { GroupDetailHistoryModel } from '../../../entity/group-detail-history.entity';

export class PatchGroupDetailHistoryResponseDto {
  constructor(
    public readonly data: GroupDetailHistoryModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
