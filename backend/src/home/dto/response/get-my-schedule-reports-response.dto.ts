import { ScheduleReportDto } from '../schedule-report.dto';

export class GetMyScheduleReportsResponseDto {
  constructor(
    public readonly data: ScheduleReportDto[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
