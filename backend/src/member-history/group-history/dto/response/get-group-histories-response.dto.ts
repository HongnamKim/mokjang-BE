import { GroupHistoryDto } from '../group-history.dto';

export class GetGroupHistoriesResponseDto {
  constructor(
    public readonly data: GroupHistoryDto[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
