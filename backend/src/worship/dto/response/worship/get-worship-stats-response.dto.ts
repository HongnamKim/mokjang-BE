export class GetWorshipStatsResponseDto {
  constructor(
    public readonly worshipId: number,
    public readonly memberCount: number,
    public readonly attendanceCheckRate: number,
    public readonly attendanceRate: {
      overall: number;
      period: number;
    },
    public readonly timestamp: Date = new Date(),
  ) {}
}
