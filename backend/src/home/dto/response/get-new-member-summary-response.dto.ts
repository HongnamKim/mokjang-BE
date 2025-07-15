export class GetNewMemberSummaryResponseDto {
  constructor(
    public readonly range: 'weekly' | 'monthly',
    public readonly unit: 'week' | 'month',
    public readonly data: { periodStart: Date; count: number }[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
