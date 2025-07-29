import { MinistryGroupDetailHistoryModel } from '../../../entity/ministry-group-detail-history.entity';

export class PatchMinistryGroupDetailHistoryResponseDto {
  constructor(
    public readonly data: MinistryGroupDetailHistoryModel,
    public readonly timestamp: Date = new Date(),
  ) {}
}
