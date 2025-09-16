export class GetWorshipSessionCheckStatusResponseDto {
  constructor(
    public readonly data: {
      id: number;
      sessionDate: Date;
      completeAttendanceCheck: boolean;
    }[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
