export class BaseOffsetPaginationResultDto<T> {
  constructor(
    public readonly data: T[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
  ) {}
}
