import { BasePaginationResultDto } from '../../../common/dto/base-pagination-result.dto';
import { SessionAttendanceModel } from '../entity/session-attendance.entity';

export interface SessionAttendancePaginationResultDto
  extends BasePaginationResultDto<SessionAttendanceModel> {}
