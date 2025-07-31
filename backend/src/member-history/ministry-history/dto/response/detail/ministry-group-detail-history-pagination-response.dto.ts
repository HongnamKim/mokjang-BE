import { MinistryGroupDetailHistoryDto } from '../ministry-group-detail-history.dto';

export class MinistryGroupDetailHistoryPaginationResponseDto {
  constructor(
    public readonly data: MinistryGroupDetailHistoryDto[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
