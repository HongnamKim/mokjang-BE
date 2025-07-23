import { OfficerHistoryModel } from '../entity/officer-history.entity';

export class OfficerHistoryPaginationResultDto {
  constructor(
    public readonly data: OfficerHistoryModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
