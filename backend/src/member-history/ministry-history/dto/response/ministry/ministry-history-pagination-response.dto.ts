import { MinistryHistoryModel } from '../../../entity/ministry-history.entity';

export class MinistryHistoryPaginationResponseDto {
  constructor(
    public readonly data: MinistryHistoryModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
