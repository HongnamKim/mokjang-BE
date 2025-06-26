import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { WorshipAttendanceModel } from '../../../entity/worship-attendance.entity';

export class WorshipAttendancePaginationResponseDto extends BaseOffsetPaginationResponseDto<WorshipAttendanceModel> {
  constructor(
    data: WorshipAttendanceModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
