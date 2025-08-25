export class MyVisitationStatusCountDto {
  constructor(
    public readonly reserve: number,
    public readonly inProgress: number,
    public readonly done: number,
    public readonly pending: number,
  ) {}
}
