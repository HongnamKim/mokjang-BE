import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { WorshipAttendanceModel } from '../../entity/worship-attendance.entity';

export class WorshipAttendanceDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<WorshipAttendanceModel> {
  constructor(data: WorshipAttendanceModel[], totalCount: number) {
    super(data, totalCount);
  }
}
