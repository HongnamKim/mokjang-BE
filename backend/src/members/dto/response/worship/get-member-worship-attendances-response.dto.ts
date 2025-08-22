import { BaseCursorPaginationResponseDto } from '../../../../common/dto/base-cursor-pagination-response.dto';
import { WorshipAttendanceModel } from '../../../../worship/entity/worship-attendance.entity';

export class GetMemberWorshipAttendancesResponseDto extends BaseCursorPaginationResponseDto<WorshipAttendanceModel> {
  constructor(
    data: WorshipAttendanceModel[],
    count: number,
    nextCursor: string | undefined,
    hasMore: boolean,
  ) {
    super(data, count, nextCursor, hasMore);
  }
}
