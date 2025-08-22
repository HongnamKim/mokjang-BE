import { WorshipAttendanceModel } from '../../../entity/worship-attendance.entity';
import { BaseCursorPaginationResponseDto } from '../../../../common/dto/base-cursor-pagination-response.dto';

export class WorshipAttendanceListResponseDto extends BaseCursorPaginationResponseDto<WorshipAttendanceModel> {
  constructor(
    data: WorshipAttendanceModel[],
    count: number,
    nextCursor: string | undefined,
    hasMore: boolean,
  ) {
    super(data, count, nextCursor, hasMore);
  }
}
