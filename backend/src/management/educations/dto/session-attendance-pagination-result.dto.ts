import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { SessionAttendanceModel } from '../entity/session-attendance.entity';

/*export interface SessionAttendancePaginationResultDto
  extends BaseOffsetPaginationResultDto<SessionAttendanceModel> {}*/

export class SessionAttendancePaginationResultDto extends BaseOffsetPaginationResponseDto<SessionAttendanceModel> {
  constructor(
    public readonly data: SessionAttendanceModel[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
