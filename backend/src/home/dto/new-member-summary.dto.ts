export class NewMemberSummaryDto {
  period_start: string;
  count: number;

  constructor(period_start: string, count: number) {
    this.period_start = period_start;
    this.count = count;
  }
}
