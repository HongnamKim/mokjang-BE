import { BaseOffsetPaginationResultDto } from '../../../common/dto/base-offset-pagination-result.dto';
import { SessionAttendanceModel } from '../entity/session-attendance.entity';

/*export interface SessionAttendancePaginationResultDto
  extends BaseOffsetPaginationResultDto<SessionAttendanceModel> {}*/

export class SessionAttendancePaginationResultDto extends BaseOffsetPaginationResultDto<SessionAttendanceModel> {
  constructor(
    public readonly data: SessionAttendanceModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page);
  }
}
