export class BaseOffsetPaginationResponseDto<T> {
  constructor(
    public readonly data: T[],
    public readonly totalCount: number,
    public readonly count: number,
    public readonly page: number,
    public readonly totalPage: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
