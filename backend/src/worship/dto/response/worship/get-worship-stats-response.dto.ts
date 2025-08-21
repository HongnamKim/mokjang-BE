export class GetWorshipStatsResponseDto {
  constructor(
    public readonly worshipId: number,
    //public readonly totalSessions: number,
    public readonly attendanceCheckRate: number,
    public readonly attendanceRate: {
      overall: number;
      period: number;
      //last4Weeks: number;
      //last12Weeks: number;
    },
    // public readonly trend: {
    //   longTerm: number;
    //   shortTerm: number;
    //   overall: number;
    // },
    public readonly timestamp: Date = new Date(),
  ) {}
}
