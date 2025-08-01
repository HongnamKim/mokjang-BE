import { MinistryGroupHistoryModel } from '../../../entity/ministry-group-history.entity';

export class MinistryGroupHistoryPaginationResponseDto {
  constructor(
    public readonly data: MinistryGroupHistoryModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
