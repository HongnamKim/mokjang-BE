import { MinistryHistoryModel } from '../../../entity/child/ministry-history.entity';

export class MinistryHistoryPaginationResponseDto {
  constructor(
    public readonly data: MinistryHistoryModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
