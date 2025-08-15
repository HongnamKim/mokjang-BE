import { BaseCursorPaginationResponseDto } from '../../../../../common/dto/base-cursor-pagination-response.dto';
import { MinistryGroupHistoryModel } from '../../../entity/ministry-group-history.entity';

export class CurrentMinistryGroupHistoryPaginationResponseDto extends BaseCursorPaginationResponseDto<MinistryGroupHistoryModel> {
  constructor(
    data: MinistryGroupHistoryModel[],
    count: number,
    nextCursor: string | undefined,
    hasMore: boolean,
  ) {
    super(data, count, nextCursor, hasMore);
  }
}
