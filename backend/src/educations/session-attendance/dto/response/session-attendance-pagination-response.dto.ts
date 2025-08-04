import { SessionAttendanceModel } from '../../entity/session-attendance.entity';

export class SessionAttendancePaginationResponseDto {
  constructor(
    public readonly data: SessionAttendanceModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
